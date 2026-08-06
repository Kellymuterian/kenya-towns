const assert = require('assert');
const kenyaTowns = require('./index.js');

const all = kenyaTowns.getAll();
assert(Array.isArray(all) && all.length > 1000, 'getAll() should return a large merged array');

// getAll() must return a fresh copy every time — mutating the result must never
// leak into the shared dataset or other callers.
{
  const first = kenyaTowns.getAll();
  first.push({ name: 'Fakesville', county: 'Nowhere', type: 'town' });
  first.sort((a, b) => a.name.localeCompare(b.name));
  const second = kenyaTowns.getAll();
  assert.strictEqual(second.length, all.length, 'mutating one getAll() result must not affect another call');
  assert.notStrictEqual(first, second, 'getAll() must return a new array reference each call');
}

const searchResult = kenyaTowns.search('kite');
assert(searchResult.some((t) => t.name.toLowerCase().includes('kite')), 'search() should find Kitengela');

// Fails-soft contract: falsy/empty input never throws, always yields the documented empty result.
assert.deepStrictEqual(kenyaTowns.search(''), [], 'search("") should return []');
assert.deepStrictEqual(kenyaTowns.search(undefined), [], 'search(undefined) should return []');
assert.deepStrictEqual(kenyaTowns.search(null), [], 'search(null) should return []');

assert.strictEqual(kenyaTowns.getByName(''), undefined, 'getByName("") should return undefined');
assert.strictEqual(kenyaTowns.getByName(undefined), undefined, 'getByName(undefined) should return undefined');
assert.strictEqual(kenyaTowns.getByName('Nowhereville'), undefined, 'getByName() miss should return undefined');

assert.deepStrictEqual(kenyaTowns.getByCounty(''), [], 'getByCounty("") should return []');
assert.deepStrictEqual(kenyaTowns.getByCounty(null), [], 'getByCounty(null) should return []');

assert.deepStrictEqual(kenyaTowns.getByConstituency(''), [], 'getByConstituency("") should return []');

assert.deepStrictEqual(kenyaTowns.getByType(''), [], 'getByType("") should return []');
assert.deepStrictEqual(kenyaTowns.getByType('village'), [], 'getByType() with an unknown type should return []');

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

// nearBy() edge cases documented in the README's Error handling section.
assert.deepStrictEqual(kenyaTowns.nearBy(-2.5, 39.5, 0), [], 'nearBy() with radiusKm 0 should return []');
assert.deepStrictEqual(kenyaTowns.nearBy(-1.2921, 36.8219, -5), [], 'nearBy() with a negative radiusKm should return []');
assert.deepStrictEqual(
  kenyaTowns.nearBy('not-a-number', 36.8219, 25),
  [],
  'nearBy() with a non-numeric lat should return [] rather than throw'
);
{
  const defaultRadius = kenyaTowns.nearBy(-1.2921, 36.8219);
  assert(defaultRadius.every((t) => t.distanceKm <= 20), 'nearBy() default radiusKm should be 20');
}

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

// query(): combined filters, OR-matching within a field, limit, and field projection.
{
  const noFilters = kenyaTowns.query();
  assert.strictEqual(noFilters.length, all.length, 'query() with no options should return everything');
  assert.notStrictEqual(noFilters, all, 'query() must return a fresh array, not a shared reference');

  const combined = kenyaTowns.query({ county: 'Kiambu', type: 'satellite' });
  assert(combined.length > 0, 'query({county, type}) should AND its filters');
  assert(
    combined.every((t) => t.county === 'Kiambu' && t.type === 'satellite'),
    'query({county, type}) results should match both filters'
  );

  const orTypes = kenyaTowns.query({ type: ['city', 'municipality'] });
  assert(
    orTypes.every((t) => t.type === 'city' || t.type === 'municipality'),
    'query({type: [...]}) should OR-match within the type field'
  );

  const limited = kenyaTowns.query({ county: 'Nairobi', limit: 3 });
  assert(limited.length <= 3, 'query({limit}) should cap the number of results');

  const projected = kenyaTowns.query({ name: 'Kite', fields: ['name'] });
  assert(projected.length > 0, 'query({fields}) should still match records');
  assert(
    projected.every((t) => Object.keys(t).length === 1 && 'name' in t),
    'query({fields: ["name"]}) should project to only the requested keys'
  );

  assert.deepStrictEqual(
    kenyaTowns.query({ county: 'Nowhereistan' }),
    [],
    'query() with a non-matching filter should return []'
  );
}

console.log('All tests passed ✅');
console.log(`Total towns in dataset: ${all.length}`);
console.log(`Total satellite towns: ${satellites.length}`);
console.log(`Total counties covered: ${counties.length}`);
