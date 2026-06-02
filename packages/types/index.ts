export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  daily_rate: number;
  city: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
}

export const LAHORE_AREAS: Area[] = [
  { id: 'johar-town', name: 'Johar Town / LUMS', description: 'Near LUMS campus' },
  { id: 'gt-road', name: 'GT Road / UET', description: 'Near UET main campus' },
  { id: 'gulberg', name: 'Gulberg / Liberty', description: 'Central Lahore hub' },
  { id: 'dha', name: 'DHA / Cantt', description: 'Defence & Cantt area' },
  { id: 'model-town', name: 'Model Town' },
  { id: 'garden-town', name: 'Garden Town' },
  { id: 'township', name: 'Township' },
  { id: 'iqbal-town', name: 'Iqbal Town' },
  { id: 'wapda-town', name: 'Wapda Town' },
  { id: 'bahria-town', name: 'Bahria Town' },
];
