// ============================================================
// @stuflux/types — shared type exports
// ============================================================

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Area types — sourced from lahore-areas.json (978 entries)
// ---------------------------------------------------------------------------

// Re-export the full LahoreArea type and all utilities from area-search
import type { LahoreArea } from './area-search';
export type { LahoreArea };
export {
  searchAreas,
  getNearbyAreas,
  getAreaById,
  getAreaName,
  POPULAR_AREA_IDS,
} from './area-search';

import LAHORE_AREAS_DATA_RAW from './lahore-areas.json';
export const LAHORE_AREAS_DATA = LAHORE_AREAS_DATA_RAW as LahoreArea[];

/**
 * Legacy Area interface — kept for backward-compatibility.
 * Prefer LahoreArea for new code.
 */
export interface Area {
  id: string;
  name: string;
  description?: string;
}

/**
 * @deprecated — Use the full dataset via lahore-areas.json + searchAreas().
 * This list is only kept as a fallback for components not yet migrated.
 */
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
