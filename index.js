'use strict';

const towns = require('./data/towns.json');

/**
 * Haversine distance in kilometers between two lat/lng points.
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
 * Return all towns in the dataset.
 * @returns {Array<Object>}
 */
function getAll() {
  return towns;
}

/**
 * Case-insensitive search by name (partial match).
 * @param {string} query
 * @returns {Array<Object>}
 */
function search(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  return towns.filter((t) => t.name.toLowerCase().includes(q));
}

/**
 * Find a single town by exact name match (case-insensitive).
 * @param {string} name
 * @returns {Object|undefined}
 */
function getByName(name) {
  if (!name) return undefined;
  const n = name.toLowerCase().trim();
  return towns.find((t) => t.name.toLowerCase() === n);
}

/**
 * Get all towns belonging to a given county (case-insensitive).
 * @param {string} county
 * @returns {Array<Object>}
 */
function getByCounty(county) {
  if (!county) return [];
  const c = county.toLowerCase().trim();
  return towns.filter((t) => t.county.toLowerCase() === c);
}

/**
 * Get all towns of a given type, e.g. "satellite", "city", "municipality", "town".
 * @param {string} type
 * @returns {Array<Object>}
 */
function getByType(type) {
  if (!type) return [];
  const t = type.toLowerCase().trim();
  return towns.filter((town) => town.type.toLowerCase() === t);
}

/**
 * Get all towns flagged as satellite towns (non-administrative, grown around a larger city).
 * @returns {Array<Object>}
 */
function getSatelliteTowns() {
  return getByType('satellite');
}

/**
 * Find towns within a given radius (km) of a lat/lng point, sorted nearest-first.
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 * @returns {Array<Object>} towns with an added `distanceKm` field
 */
function nearBy(lat, lng, radiusKm = 20) {
  return towns
    .map((t) => ({ ...t, distanceKm: distanceKm(lat, lng, t.lat, t.lng) }))
    .filter((t) => t.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * List of distinct counties present in the dataset.
 * @returns {Array<string>}
 */
function listCounties() {
  return [...new Set(towns.map((t) => t.county))].sort();
}

module.exports = {
  getAll,
  search,
  getByName,
  getByCounty,
  getByType,
  getSatelliteTowns,
  nearBy,
  listCounties,
};
