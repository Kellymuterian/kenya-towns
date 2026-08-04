export type TownType = 'city' | 'municipality' | 'town' | 'satellite' | 'ward';

export interface Town {
  name: string;
  county: string;
  type: TownType;
  lat?: number;
  lng?: number;
  constituency?: string;
  population?: number;
}

export interface TownWithDistance extends Town {
  distanceKm: number;
}

export function getAll(): Town[];
export function search(query: string): Town[];
export function getByName(name: string): Town | undefined;
export function getByCounty(county: string): Town[];
export function getByConstituency(constituency: string): Town[];
export function getByType(type: TownType): Town[];
export function getSatelliteTowns(): Town[];
export function nearBy(lat: number, lng: number, radiusKm?: number): TownWithDistance[];
export function listCounties(): string[];
