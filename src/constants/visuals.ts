import type { IconName } from '@/components/ui';

/**
 * Visual identity per catalogue entry. Sub-categories get their own glyph so service
 * thumbnails in one category don't all look identical; categories map to an illustrated
 * scene (see `components/domain/Scenes.tsx`).
 */
export const SUBCATEGORY_ICON: Record<string, IconName> = {
  cat_clean_1: 'sparkles', cat_clean_2: 'bath', cat_clean_3: 'chef-hat', cat_clean_4: 'sofa',
  cat_ac_1: 'snowflake', cat_ac_2: 'fridge', cat_ac_3: 'washer', cat_ac_4: 'glass-water',
  cat_elec_1: 'plug', cat_elec_2: 'fan', cat_elec_3: 'bulb',
  cat_plumb_1: 'droplets', cat_plumb_2: 'shower', cat_plumb_3: 'toilet',
  cat_salon_1: 'sparkle', cat_salon_2: 'flower', cat_salon_3: 'hand', cat_salon_4: 'wind',
  cat_men_1: 'scissors', cat_men_2: 'brush', cat_men_3: 'hand',
  cat_paint_1: 'roller', cat_paint_2: 'home', cat_paint_3: 'shield',
  cat_pest_1: 'bug', cat_pest_2: 'shield-check', cat_pest_3: 'bed',
  cat_carp_1: 'sofa', cat_carp_2: 'door', cat_carp_3: 'hammer',
  cat_laundry_1: 'washer', cat_laundry_2: 'shirt', cat_laundry_3: 'waves',
  cat_car_1: 'droplets', cat_car_2: 'gem', cat_car_3: 'car-front',
  cat_spa_1: 'leaf', cat_spa_2: 'yoga', cat_spa_3: 'footprints',
};

export type SceneKey = 'clean' | 'ac' | 'repair' | 'plumbing' | 'salon' | 'grooming' | 'paint' | 'pest' | 'laundry' | 'car' | 'spa' | 'pro';

export const CATEGORY_SCENE: Record<string, SceneKey> = {
  cat_clean: 'clean', cat_ac: 'ac', cat_elec: 'repair', cat_plumb: 'plumbing', cat_salon: 'salon', cat_men: 'grooming',
  cat_paint: 'paint', cat_pest: 'pest', cat_carp: 'repair', cat_laundry: 'laundry', cat_car: 'car', cat_spa: 'spa',
};
