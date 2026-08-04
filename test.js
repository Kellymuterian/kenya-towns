const assert = require('assert');
const kenyaTowns = require('./index.js');

const all = kenyaTowns.getAll();
assert(Array.isArray(all) && all.length > 1000, 'getAll() should return a large merged array');

const searchResult = kenyaTowns.search('kite');
assert(searchResult.some((t) => t.name.toLowerCase().includes('kite')), 'search() should find Kitengela');

const byName = kenyaTowns.getByName('Syokimau');
assert(byName && byName.county === 'Machakos', 'getByName() should find Syokimau in Machakos');
assert(byName.lat === -1.3691 && byName.lng === 36.9436, 'Syokimau coordinates should be unchanged by the merge');

const byCounty = kenyaTowns.getByCounty('Kiambu');
assert(byCounty.length > 0, 'getByCounty() should return Kiambu towns');

const satellites = kenyaTowns.getSatelliteTowns();
assert(satellites.length > 0, 'getSatelliteTowns() should return satellite towns');
assert(satellites.every((t) => t.type === 'satellite'), 'all results should be type satellite');

const near = kenyaTowns.nearBy(-1.2921, 36.8219, 25); // near Nairobi CBD
assert(near.length > 0, 'nearBy() should find towns near Nairobi');
assert(near[0].distanceKm <= near[near.length - 1].distanceKm, 'nearBy() should sort by distance ascending');
assert(near.every((t) => t.type !== 'ward'), 'nearBy() should never return coordinate-less ward records');

const counties = kenyaTowns.listCounties();
assert(counties.includes('Nairobi'), 'listCounties() should include Nairobi');
assert(counties.length === 47, 'listCounties() should reflect all 47 Kenyan counties');

const wards = kenyaTowns.getByType('ward');
assert(wards.length > 0, 'getByType("ward") should return ward records');
assert(
  wards.every((t) => t.lat === undefined && t.lng === undefined),
  'ward records should have no coordinates'
);

const dadaabWards = kenyaTowns.getByConstituency('Dadaab');
assert(dadaabWards.length > 0, 'getByConstituency() should return wards for Dadaab');
assert(
  dadaabWards.every((t) => t.type === 'ward' && t.county === 'Garissa'),
  'getByConstituency() results should be Garissa wards'
);

console.log('All tests passed ✅');
console.log(`Total towns in dataset: ${all.length}`);
console.log(`Total satellite towns: ${satellites.length}`);
console.log(`Total counties covered: ${counties.length}`);
