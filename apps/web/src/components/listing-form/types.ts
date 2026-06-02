export interface ListingFormData {
  // Step 1: Photos
  photo_urls: string[];
  
  // Step 2: Category + Title
  category_id: number;
  title: string;

  // Step 3: Description, Condition, Specs
  description: string;
  condition: 'like_new' | 'good' | 'fair' | 'well_used' | '';
  specs: Record<string, string>;

  // Step 4: Pricing + Terms
  daily_rate: number;
  security_deposit: number;
  min_rental_days: number;
  max_rental_days: number;
  delivery_available: boolean;
  delivery_fee: number;
  rental_rules: string;

  // Step 5: Area
  area: string; // from LAHORE_AREAS

  // Step 6: Availability
  blocked_dates: { start_date: string; end_date: string }[];

  // Internal
  status: 'draft' | 'active';
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
