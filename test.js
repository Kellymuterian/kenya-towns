const assert = require('assert');
const kenyaTowns = require('./index.js');

const all = kenyaTowns.getAll();
assert(Array.isArray(all) && all.length > 0, 'getAll() should return a non-empty array');

const searchResult = kenyaTowns.search('kite');
assert(searchResult.some((t) => t.name.toLowerCase().includes('kite')), 'search() should find Kitengela');

const byName = kenyaTowns.getByName('Syokimau');
assert(byName && byName.county === 'Machakos', 'getByName() should find Syokimau in Machakos');

const byCounty = kenyaTowns.getByCounty('Kiambu');
assert(byCounty.length > 0, 'getByCounty() should return Kiambu towns');

const satellites = kenyaTowns.getSatelliteTowns();
assert(satellites.length > 0, 'getSatelliteTowns() should return satellite towns');
assert(satellites.every((t) => t.type === 'satellite'), 'all results should be type satellite');

const near = kenyaTowns.nearBy(-1.2921, 36.8219, 25); // near Nairobi CBD
assert(near.length > 0, 'nearBy() should find towns near Nairobi');
assert(near[0].distanceKm <= near[near.length - 1].distanceKm, 'nearBy() should sort by distance ascending');

const counties = kenyaTowns.listCounties();
assert(counties.includes('Nairobi'), 'listCounties() should include Nairobi');

console.log('All tests passed ✅');
console.log(`Total towns in dataset: ${all.length}`);
console.log(`Total satellite towns: ${satellites.length}`);
console.log(`Total counties covered: ${counties.length}`);
