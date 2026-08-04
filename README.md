# kenya-towns

A dependency-free npm package providing a comprehensive dataset of Kenyan towns, cities,
**satellite/informal settlements**, and administrative wards, plus a handful of query helper
functions to search and filter them.

It includes both hand-curated places — like Syokimau, Kitengela, Ongata Rongai, Ruaka, and
Karen — that other Kenya geodata packages leave out because they aren't official administrative
divisions, *and* a bulk merge of GeoNames' populated-places data and the official
county/constituency/ward hierarchy — over 8,000 records across all 47 counties.

There is no database, no network calls, and no async I/O: the dataset is a static JSON file
loaded into memory, and every function is a synchronous, in-memory filter/map/sort over it.

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Data shape](#data-shape)
- [API reference](#api-reference)
  - [getAll()](#getall)
  - [search(query)](#searchquery)
  - [getByName(name)](#getbynamename)
  - [getByCounty(county)](#getbycountycounty)
  - [getByConstituency(constituency)](#getbyconstituencyconstituency)
  - [getByType(type)](#getbytypetype)
  - [getSatelliteTowns()](#getsatellitetowns)
  - [nearBy(lat, lng, radiusKm)](#nearbylat-lng-radiuskm)
  - [listCounties()](#listcounties)
- [Error handling](#error-handling)
- [TypeScript support](#typescript-support)
- [Attribution](#attribution)
- [Versioning and changelog](#versioning-and-changelog)
- [License](#license)

## Installation

```bash
npm install kenya-towns
```

Requires Node.js `>=12`. No peer dependencies, no config, nothing to build.

## Quick start

```js
const kenyaTowns = require('kenya-towns');

// Get everything in the dataset
const all = kenyaTowns.getAll();
console.log(all.length); // 8000+

// Find a specific place
const syokimau = kenyaTowns.getByName('Syokimau');
console.log(syokimau);
// => { name: 'Syokimau', county: 'Machakos', type: 'satellite',
//      lat: -1.3691, lng: 36.9436 }

// Find everything within 15km of Nairobi CBD, nearest first
const nearby = kenyaTowns.nearBy(-1.2921, 36.8219, 15);
console.log(nearby.map((t) => `${t.name} (${t.distanceKm.toFixed(1)}km)`));
```

ES module / TypeScript import syntax also works if your bundler/transpiler supports CommonJS
interop:

```ts
import * as kenyaTowns from 'kenya-towns';
// or, since there's no default export:
import { getAll, search, nearBy, Town } from 'kenya-towns';
```

## Data shape

Each record is a plain object. Most places (cities, municipalities, towns, satellites) look
like this:

```json
{
  "name": "Syokimau",
  "county": "Machakos",
  "type": "satellite",
  "lat": -1.3691,
  "lng": 36.9436
}
```

Ward records (from the official administrative hierarchy) have **no coordinates** but carry a
`constituency` instead:

```json
{
  "name": "Abakaile",
  "county": "Garissa",
  "constituency": "Dadaab",
  "type": "ward"
}
```

### Fields

| Field          | Type                  | Always present? | Notes                                                                 |
|----------------|-----------------------|------------------|------------------------------------------------------------------------|
| `name`         | `string`               | yes              | Place name.                                                            |
| `county`       | `string`               | yes              | One of Kenya's 47 counties.                                            |
| `type`         | `TownType`              | yes              | `'city'` \| `'municipality'` \| `'town'` \| `'satellite'` \| `'ward'`   |
| `lat`          | `number`                | no               | Omitted on records with no coordinates (currently only `ward`s).       |
| `lng`          | `number`                | no               | Same as above.                                                         |
| `constituency` | `string`                | no               | Present on `ward` records; the constituency the ward belongs to.       |
| `population`   | `number`                | no               | Present when GeoNames reports a population figure.                    |

### `type` values

- `city` — officially gazetted city
- `municipality` — officially gazetted municipality
- `town` — recognized town, not necessarily its own administrative seat
- `satellite` — grown organically around a larger city/town, not an independent administrative
  unit (e.g. Syokimau, Kitengela, Ruaka) — this is the data other Kenya geodata packages miss
- `ward` — official administrative ward; has no coordinates, has a `constituency` instead

## API reference

All functions are synchronous and return plain objects/arrays — nothing async, nothing to
`await`. Query helpers never mutate `data/towns.json`; they always return new arrays.

### `getAll()`

Returns every record in the dataset, in file order.

```js
kenyaTowns.getAll(); // => Town[] (8000+ records)
```

**Returns:** `Town[]`

---

### `search(query)`

Case-insensitive **partial** match on `name`. Matches anywhere in the name, not just the start.

```js
kenyaTowns.search('kite');
// => [{ name: 'Kitengela', ... }, ...any other name containing "kite"]

kenyaTowns.search('  KITE  '); // whitespace and case are normalized
// => same result as above
```

**Parameters:**
| Name    | Type     | Required | Description                  |
|---------|----------|----------|-------------------------------|
| `query` | `string` | yes      | Substring to match against `name`, case-insensitive. |

**Returns:** `Town[]` — empty array if `query` is falsy (`''`, `null`, `undefined`) or nothing matches.

---

### `getByName(name)`

Case-insensitive **exact** match on `name`.

```js
kenyaTowns.getByName('syokimau'); // case doesn't matter
// => { name: 'Syokimau', county: 'Machakos', type: 'satellite', lat: -1.3691, lng: 36.9436 }

kenyaTowns.getByName('Nowhereville');
// => undefined
```

**Parameters:**
| Name   | Type     | Required | Description                          |
|--------|----------|----------|----------------------------------------|
| `name` | `string` | yes      | Exact town name, case-insensitive.    |

**Returns:** `Town | undefined` — `undefined` if `name` is falsy or no exact match is found.

---

### `getByCounty(county)`

Case-insensitive exact match on `county`.

```js
kenyaTowns.getByCounty('kiambu');
// => [{ name: 'Ruaka', county: 'Kiambu', ... }, { name: 'Thika', county: 'Kiambu', ... }, ...]
```

**Parameters:**
| Name     | Type     | Required | Description                    |
|----------|----------|----------|----------------------------------|
| `county` | `string` | yes      | County name, case-insensitive.  |

**Returns:** `Town[]` — empty array if `county` is falsy or no towns are found in that county.

---

### `getByConstituency(constituency)`

Case-insensitive exact match on `constituency`. Only `ward` records carry a `constituency`
field, so in practice this only returns wards.

```js
kenyaTowns.getByConstituency('Dadaab');
// => [{ name: 'Abakaile', county: 'Garissa', constituency: 'Dadaab', type: 'ward' }, ...]
```

**Parameters:**
| Name            | Type     | Required | Description                          |
|-----------------|----------|----------|----------------------------------------|
| `constituency`  | `string` | yes      | Constituency name, case-insensitive.  |

**Returns:** `Town[]` — empty array if `constituency` is falsy or nothing matches.

---

### `getByType(type)`

Case-insensitive exact match on `type`.

```js
kenyaTowns.getByType('satellite');
// => all satellite towns

kenyaTowns.getByType('ward');
// => all ward records (no lat/lng)
```

**Parameters:**
| Name   | Type       | Required | Description                                                       |
|--------|------------|----------|----------------------------------------------------------------------|
| `type` | `TownType` | yes      | `'city'` \| `'municipality'` \| `'town'` \| `'satellite'` \| `'ward'` |

**Returns:** `Town[]` — empty array if `type` is falsy or no towns of that type exist.

---

### `getSatelliteTowns()`

Shorthand for `getByType('satellite')`. This is effectively the package's headline feature:
the informally-grown towns (Syokimau, Kitengela, Ongata Rongai, Ruaka, Karen, etc.) that
official administrative-division datasets omit.

```js
kenyaTowns.getSatelliteTowns();
// => [{ name: 'Syokimau', ... }, { name: 'Kitengela', ... }, ...]
```

**Returns:** `Town[]`

---

### `nearBy(lat, lng, radiusKm)`

Finds towns within `radiusKm` kilometers of a `(lat, lng)` point, using the Haversine formula,
sorted nearest-first. Records without coordinates (currently `ward`s) are always excluded,
since distance can't be computed for them.

```js
// 15km around Nairobi CBD
kenyaTowns.nearBy(-1.2921, 36.8219, 15);
// => [{ name: 'Karen', ..., distanceKm: 9.87 }, { name: 'Ruaka', ..., distanceKm: 12.3 }, ...]

// radiusKm defaults to 20 if omitted
kenyaTowns.nearBy(-1.2921, 36.8219);
```

Each result object is the original town record plus an added `distanceKm` field (the original
records in `getAll()` etc. do **not** have `distanceKm` — it's computed and attached only by
this function).

**Parameters:**
| Name       | Type     | Required | Default | Description                                  |
|------------|----------|----------|---------|-------------------------------------------------|
| `lat`      | `number` | yes      | —       | Latitude of the search origin.                 |
| `lng`      | `number` | yes      | —       | Longitude of the search origin.                |
| `radiusKm` | `number` | no       | `20`    | Search radius in kilometers.                   |

**Returns:** `TownWithDistance[]` — sorted ascending by `distanceKm`; empty array if nothing is
within range.

---

### `listCounties()`

Returns the distinct, alphabetically sorted list of county names present in the dataset
(all 47 Kenyan counties).

```js
kenyaTowns.listCounties();
// => ['Baringo', 'Bomet', 'Bungoma', ..., 'West Pokot']
```

**Returns:** `string[]`

## Error handling

This package does not throw for bad input — it fails soft by design, so you don't need to
wrap calls in `try`/`catch` for normal use:

- Passing `undefined`, `null`, or an empty string for a required `string` parameter
  (`search`, `getByName`, `getByCounty`, `getByConstituency`, `getByType`) returns an **empty
  array** (or `undefined` for `getByName`, since it returns a single record) instead of
  throwing.
- A query that matches nothing returns an empty array (or `undefined` for `getByName`) — never
  `null` and never a thrown error.
- `nearBy()` expects `lat`/`lng` to be numbers. Passing non-numeric values (e.g. strings) will
  produce `NaN` distances rather than throwing; those results are then dropped by the
  `distanceKm <= radiusKm` filter, so you'll simply get an empty array back. Validate `lat`/`lng`
  yourself before calling if you need to distinguish "bad input" from "nothing nearby."
- The dataset itself (`data/towns.json`) is loaded once at `require()` time. If the package is
  installed correctly, this cannot fail at runtime — there's no file I/O, network call, or
  parsing step to catch errors from after that point.

In short: check for `undefined` (from `getByName`) or empty arrays (from everything else)
rather than catching exceptions.

## TypeScript support

Type definitions are bundled in `index.d.ts` — no separate `@types/kenya-towns` package needed.

```ts
import { getAll, getByType, nearBy, Town, TownType, TownWithDistance } from 'kenya-towns';

const cities: Town[] = getByType('city');

const results: TownWithDistance[] = nearBy(-1.2921, 36.8219, 15);
results.forEach((t) => console.log(t.name, t.distanceKm));

// TownType is a string-literal union, so this is a compile error:
// getByType('village'); // Argument of type '"village"' is not assignable to parameter of type 'TownType'
```

Exported types:

| Type                | Shape                                                                             |
|---------------------|-------------------------------------------------------------------------------------|
| `TownType`          | `'city' \| 'municipality' \| 'town' \| 'satellite' \| 'ward'`                       |
| `Town`              | `{ name: string; county: string; type: TownType; lat?: number; lng?: number; constituency?: string; population?: number }` |
| `TownWithDistance`  | `Town & { distanceKm: number }`                                                     |

## Attribution

This package bundles data from:

- **[GeoNames](https://www.geonames.org/)** — populated-places data (name, coordinates,
  population), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **[kenya-administrative-divisions](https://www.npmjs.com/package/kenya-administrative-divisions)**
  (MIT) — the official county/constituency/ward hierarchy.

Two other sources were evaluated and intentionally excluded from the shipped dataset:
- **Simplemaps' Kenya Cities Database** — its free tier's license prohibits public
  redistribution without permission, which is incompatible with publishing the data in this
  open-source package. It was only used locally to spot-check a sample of merged coordinates,
  never committed.
- **AFRICOVER/FAO's Kenya towns layer** — an old (~1998–2000) 1:100,000-scale shapefile, skipped
  as low marginal value over GeoNames' more current, more complete coverage.

## Versioning and changelog

This package follows [Semantic Versioning](https://semver.org/). There is no separate
`CHANGELOG.md`; release notes live in the git history and npm's version history page. Notable
releases so far:

- **1.1.0** — Added the official county/constituency/ward hierarchy and a bulk GeoNames merge
  (8,000+ records, up from ~100 curated entries). Added `getByConstituency()`, `ward` as a
  `type`, and `constituency`/`population` fields. `nearBy()` now filters out coordinate-less
  records (i.e. wards) instead of returning `NaN` distances for them.
- **1.0.0** — Initial release: hand-curated dataset of Kenyan cities, municipalities, towns, and
  satellite settlements, with `getAll`, `search`, `getByName`, `getByCounty`, `getByType`,
  `getSatelliteTowns`, `nearBy`, and `listCounties`.

Check `version` in [package.json](package.json) for the currently installed version.

## License

MIT
