# kenya-towns

Comprehensive dataset of Kenyan towns, cities, **satellite/informal settlements**, and
administrative wards. It includes both the hand-curated places like Syokimau, Kitengela,
Ongata Rongai, Ruaka, and Karen that other Kenya geodata packages leave out because they
aren't official administrative divisions, *and* a bulk merge of GeoNames' populated-places
data and the official county/constituency/ward hierarchy — over 8,000 records across all
47 counties.

## Install

```bash
npm install kenya-towns
```

## Usage

```js
const kenyaTowns = require('kenya-towns');

// Get everything
const all = kenyaTowns.getAll();

// Search by (partial) name
kenyaTowns.search('kite'); // => [{ name: 'Kitengela', ... }]

// Exact match
kenyaTowns.getByName('Syokimau');

// All towns in a county
kenyaTowns.getByCounty('Kiambu');

// All wards in a constituency
kenyaTowns.getByConstituency('Dadaab');

// Filter by type: 'city' | 'municipality' | 'town' | 'satellite' | 'ward'
kenyaTowns.getByType('satellite');
kenyaTowns.getSatelliteTowns(); // shorthand for getByType('satellite')

// Find towns within X km of a point (sorted nearest-first)
kenyaTowns.nearBy(-1.2921, 36.8219, 15); // 15km around Nairobi CBD

// List distinct counties represented in the dataset
kenyaTowns.listCounties();
```

## Data shape

Each record looks like:

```json
{
  "name": "Syokimau",
  "county": "Machakos",
  "type": "satellite",
  "lat": -1.3691,
  "lng": 36.9436,
  "source": "curated"
}
```

Ward records (from the official administrative hierarchy) have no coordinates but carry
a `constituency` instead:

```json
{
  "name": "Abakaile",
  "county": "Garissa",
  "constituency": "Dadaab",
  "type": "ward",
  "source": "kenya-administrative-divisions"
}
```

`type` is one of:
- `city` — officially gazetted city
- `municipality` — officially gazetted municipality
- `town` — recognized town, not necessarily its own administrative seat
- `satellite` — grown organically around a larger city/town, not an independent
  administrative unit (e.g. Syokimau, Kitengela, Ruaka)
- `ward` — official administrative ward (no coordinates); see `constituency`

`source` tracks provenance and is one of `curated`, `geonames`, or
`kenya-administrative-divisions` (see Attribution below). `lat`/`lng` are omitted on
records that don't have coordinates (currently just wards), and `population` is present
when GeoNames reports one.

## Attribution

This package bundles data from:

- **[GeoNames](https://www.geonames.org/)** — populated-places data (name, coordinates,
  population), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **[kenya-administrative-divisions](https://www.npmjs.com/package/kenya-administrative-divisions)**
  (MIT) — the official county/constituency/ward hierarchy.

Two other sources were evaluated and intentionally excluded from the shipped dataset:
- **Simplemaps' Kenya Cities Database** — its free tier's license prohibits public
  redistribution without permission, which is incompatible with publishing the data in
  this open-source package. It was only used locally to spot-check a sample of merged
  coordinates, never committed.
- **AFRICOVER/FAO's Kenya towns layer** — an old (~1998-2000) 1:100,000-scale shapefile,
  skipped as low marginal value over GeoNames' more current, more complete coverage.

## TypeScript

Type definitions are bundled — no `@types` package needed.

```ts
import { getAll, Town, TownType } from 'kenya-towns';
```

## Contributing / expanding the dataset

`data/towns.json` combines a hand-curated core (~100 places, `source: "curated"`) with a
bulk merge of GeoNames and `kenya-administrative-divisions` data (`scripts/merge-sources.js`,
a maintainer-only script — not published with the package). PRs adding/correcting curated
entries (especially satellite towns) are welcome — just follow the existing shape and set
`source: "curated"`. To refresh the bulk-merged data, run `node scripts/merge-sources.js`;
it re-fetches GeoNames and re-derives wards without touching curated entries.

## Publishing (for maintainers)

```bash
npm login
npm publish
```

## License

MIT
