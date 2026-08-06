'use strict';

/**
 * @typedef {'city'|'municipality'|'town'|'satellite'|'ward'} TownType
 */

/**
 * @typedef {Object} Town
 * @property {string} name
 * @property {string} county
 * @property {TownType} type
 * @property {number} [lat]
 * @property {number} [lng]
 * @property {string} [constituency]
 * @property {number} [population]
 */

/**
 * @typedef {Town & { distanceKm: number }} TownWithDistance
 */

/**
 * @typedef {Object} QueryOptions
 * @property {string} [name] Substring to match against `name`, case-insensitive.
 * @property {string|string[]} [county] County name or list of county names (OR match), case-insensitive.
 * @property {TownType|TownType[]} [type] Type or list of types (OR match), case-insensitive.
 * @property {string} [constituency] Constituency name, case-insensitive.
 * @property {number} [limit] Max number of results to return.
 * @property {Array<keyof Town>} [fields] If set, return objects containing only these keys.
 */

let _towns;
/** Lazily loads and caches the dataset so it's only read into memory on first use. */
function getTowns() {
  if (!_towns) {
    _towns = require('./data/towns.json');
  }
  return _towns;
}

/**
 * Haversine distance in kilometers between two lat/lng points.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number}
 */
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Return all towns in the dataset, in file order.
 *
 * The returned array is a fresh copy on every call — mutating it (e.g. `.sort()`,
 * `.push()`) never affects the underlying dataset or other callers.
 * @returns {Town[]}
 */
function getAll() {
  return getTowns().slice();
}

/**
 * Case-insensitive search by name (partial match).
 * @param {string} query
 * @returns {Town[]}
 */
function search(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  return getTowns().filter((t) => t.name.toLowerCase().includes(q));
}

/**
 * Find a single town by exact name match (case-insensitive).
 * @param {string} name
 * @returns {Town|undefined}
 */
function getByName(name) {
  if (!name) return undefined;
  const n = name.toLowerCase().trim();
  return getTowns().find((t) => t.name.toLowerCase() === n);
}

/**
 * Get all towns belonging to a given county (case-insensitive).
 * @param {string} county
 * @returns {Town[]}
 */
function getByCounty(county) {
  if (!county) return [];
  const c = county.toLowerCase().trim();
  return getTowns().filter((t) => t.county.toLowerCase() === c);
}

/**
 * Get all towns/wards belonging to a given constituency (case-insensitive).
 * @param {string} constituency
 * @returns {Town[]}
 */
function getByConstituency(constituency) {
  if (!constituency) return [];
  const c = constituency.toLowerCase().trim();
  return getTowns().filter((t) => t.constituency && t.constituency.toLowerCase() === c);
}

/**
 * Get all towns of a given type, e.g. "satellite", "city", "municipality", "town", "ward".
 * @param {TownType} type
 * @returns {Town[]}
 */
function getByType(type) {
  if (!type) return [];
  const t = type.toLowerCase().trim();
  return getTowns().filter((town) => town.type.toLowerCase() === t);
}

/**
 * Get all towns flagged as satellite towns (non-administrative, grown around a larger city).
 * @returns {Town[]}
 */
function getSatelliteTowns() {
  return getByType('satellite');
}

/**
 * Find towns within a given radius (km) of a lat/lng point, sorted nearest-first.
 * @param {number} lat
 * @param {number} lng
 * @param {number} [radiusKm]
 * @returns {TownWithDistance[]} towns with an added `distanceKm` field
 */
function nearBy(lat, lng, radiusKm = 20) {
  return getTowns()
    .filter((t) => t.lat != null && t.lng != null)
    .map((t) => ({ ...t, distanceKm: distanceKm(lat, lng, t.lat, t.lng) }))
    .filter((t) => t.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * List of distinct counties present in the dataset.
 * @returns {string[]}
 */
function listCounties() {
  return [...new Set(getTowns().map((t) => t.county))].sort();
}

/**
 * Combine multiple filters in a single call (all provided filters are ANDed together;
 * `county`/`type` accept an array for an OR match within that field), with optional
 * result limiting and field projection.
 * @param {QueryOptions} [options]
 * @returns {Town[]|Partial<Town>[]}
 */
function query(options = {}) {
  const { name, county, type, constituency, limit, fields } = options;
  let results = getTowns().slice();

  if (name) {
    const n = name.toLowerCase().trim();
    results = results.filter((t) => t.name.toLowerCase().includes(n));
  }

  if (county) {
    const counties = (Array.isArray(county) ? county : [county]).map((c) => c.toLowerCase().trim());
    results = results.filter((t) => counties.includes(t.county.toLowerCase()));
  }

  if (type) {
    const types = (Array.isArray(type) ? type : [type]).map((t) => t.toLowerCase().trim());
    results = results.filter((t) => types.includes(t.type.toLowerCase()));
  }

  if (constituency) {
    const c = constituency.toLowerCase().trim();
    results = results.filter((t) => t.constituency && t.constituency.toLowerCase() === c);
  }

  if (typeof limit === 'number') {
    results = results.slice(0, limit);
  }

  if (Array.isArray(fields) && fields.length > 0) {
    results = results.map((t) => {
      const projected = {};
      for (const field of fields) {
        if (field in t) projected[field] = t[field];
      }
      return projected;
    });
  }

  return results;
}

module.exports = {
  getAll,
  search,
  getByName,
  getByCounty,
  getByConstituency,
  getByType,
  getSatelliteTowns,
  nearBy,
  listCounties,
  query,
};
