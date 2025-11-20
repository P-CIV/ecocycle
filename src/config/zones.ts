export const ZONES = [
  'Abobo',
  'Adjamé',
  'Attécoubé',
  'Cocody',
  'Koumassi',
  'Marcory',
  'Plateau',
  'Port-Bouët',
  'Treichville',
  'Yopougon',
  'Songon',
  'Anyama',
  'Bingerville'
] as const;

export type Zone = typeof ZONES[number];

export const isValidZone = (zone: string): zone is Zone => {
  return ZONES.includes(zone as Zone);
};

export interface ZoneInfo {
  id: string;
  name: Zone;
  active: boolean;
  description?: string;
}
