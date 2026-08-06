declare const _exports: {
    getAll: typeof getAll;
    search: typeof search;
    getByName: typeof getByName;
    getByCounty: typeof getByCounty;
    getByConstituency: typeof getByConstituency;
    getByType: typeof getByType;
    getSatelliteTowns: typeof getSatelliteTowns;
    nearBy: typeof nearBy;
    listCounties: typeof listCounties;
    query: typeof query;
};
export = _exports;
export type TownType = 'city' | 'municipality' | 'town' | 'satellite' | 'ward';
export type Town = {
    name: string;
    county: string;
    type: TownType;
    lat?: number;
    lng?: number;
    constituency?: string;
    population?: number;
};
export type TownWithDistance = Town & {
    distanceKm: number;
};
export type QueryOptions = {
    /**
     * Substring to match against `name`, case-insensitive.
     */
    name?: string;
    /**
     * County name or list of county names (OR match), case-insensitive.
     */
    county?: string | string[];
    /**
     * Type or list of types (OR match), case-insensitive.
     */
    type?: TownType | TownType[];
    /**
     * Constituency name, case-insensitive.
     */
    constituency?: string;
    /**
     * Max number of results to return.
     */
    limit?: number;
    /**
     * If set, return objects containing only these keys.
     */
    fields?: Array<keyof Town>;
};
/**
 * Return all towns in the dataset, in file order.
 *
 * The returned array is a fresh copy on every call — mutating it (e.g. `.sort()`,
 * `.push()`) never affects the underlying dataset or other callers.
 * @returns {Town[]}
 */
declare function getAll(): Town[];
/**
 * Case-insensitive search by name (partial match).
 * @param {string} query
 * @returns {Town[]}
 */
declare function search(query: string): Town[];
/**
 * Find a single town by exact name match (case-insensitive).
 * @param {string} name
 * @returns {Town|undefined}
 */
declare function getByName(name: string): Town | undefined;
/**
 * Get all towns belonging to a given county (case-insensitive).
 * @param {string} county
 * @returns {Town[]}
 */
declare function getByCounty(county: string): Town[];
/**
 * Get all towns/wards belonging to a given constituency (case-insensitive).
 * @param {string} constituency
 * @returns {Town[]}
 */
declare function getByConstituency(constituency: string): Town[];
/**
 * Get all towns of a given type, e.g. "satellite", "city", "municipality", "town", "ward".
 * @param {TownType} type
 * @returns {Town[]}
 */
declare function getByType(type: TownType): Town[];
/**
 * Get all towns flagged as satellite towns (non-administrative, grown around a larger city).
 * @returns {Town[]}
 */
declare function getSatelliteTowns(): Town[];
/**
 * Find towns within a given radius (km) of a lat/lng point, sorted nearest-first.
 * @param {number} lat
 * @param {number} lng
 * @param {number} [radiusKm]
 * @returns {TownWithDistance[]} towns with an added `distanceKm` field
 */
declare function nearBy(lat: number, lng: number, radiusKm?: number): TownWithDistance[];
/**
 * List of distinct counties present in the dataset.
 * @returns {string[]}
 */
declare function listCounties(): string[];
/**
 * Combine multiple filters in a single call (all provided filters are ANDed together;
 * `county`/`type` accept an array for an OR match within that field), with optional
 * result limiting and field projection.
 * @param {QueryOptions} [options]
 * @returns {Town[]|Partial<Town>[]}
 */
declare function query(options?: QueryOptions): Town[] | Partial<Town>[];
