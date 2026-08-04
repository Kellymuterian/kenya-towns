# kenya-towns

Comprehensive dataset of Kenyan towns, cities, and **satellite/informal settlements** —
not just administrative units (counties, sub-counties, wards). Includes places like
Syokimau, Kitengela, Ongata Rongai, Ruaka, and Karen that other Kenya geodata packages
leave out because they aren't official administrative divisions.

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

// Filter by type: 'city' | 'municipality' | 'town' | 'satellite'
kenyaTowns.getByType('satellite');
kenyaTowns.getSatelliteTowns(); // shorthand for getByType('satellite')

// Find towns within X km of a point (sorted nearest-first)
kenyaTowns.nearBy(-1.2921, 36.8219, 15); // 15km around Nairobi CBD

// List distinct counties represented in the dataset
kenyaTowns.listCounties();
```

## Data shape

Each town looks like:

```json
{
  "name": "Syokimau",
  "county": "Machakos",
  "type": "satellite",
  "lat": -1.3691,
  "lng": 36.9436
}
```

`type` is one of:
- `city` — officially gazetted city
- `municipality` — officially gazetted municipality
- `town` — recognized town, not necessarily its own administrative seat
- `satellite` — grown organically around a larger city/town, not an independent
  administrative unit (e.g. Syokimau, Kitengela, Ruaka)

## TypeScript

Type definitions are bundled — no `@types` package needed.

```ts
import { getAll, Town, TownType } from 'kenya-towns';
```

## Contributing / expanding the dataset

This is a starter dataset (~100 towns across all 47 counties). PRs adding missing
towns, correcting coordinates, or adding fields (population, postal code, etc.) are
welcome — just follow the existing shape in `data/towns.json`.

## Publishing (for maintainers)

```bash
npm login
npm publish
```

## License

MIT
