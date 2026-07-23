export interface FacialFeatureOption {
  id: string;
  name: string;
  category: 'beard' | 'mustache' | 'horns' | 'longEars';
  isOverride?: boolean;
}

export const BEARD_OPTIONS: FacialFeatureOption[] = [
  { id: 'none', name: 'None', category: 'beard' },
  { id: '5oclock_shadow', name: "5 O'Clock Shadow", category: 'beard' },
  { id: 'basic', name: 'Basic Beard', category: 'beard' },
  { id: 'winter', name: 'Winter Beard', category: 'beard' }
];

export const MUSTACHE_OPTIONS: FacialFeatureOption[] = [
  { id: 'none', name: 'None', category: 'mustache' },
  { id: 'basic', name: 'Basic Mustache', category: 'mustache' },
  { id: 'bigstache', name: 'Grand Mustache', category: 'mustache' },
  { id: 'french', name: 'French Handlebar', category: 'mustache' }
];

export const HORN_OPTIONS: FacialFeatureOption[] = [
  { id: 'none', name: 'None', category: 'horns' },
  { id: 'curled', name: 'Curled Horns', category: 'horns', isOverride: true },
  { id: 'backwards', name: 'Backwards Horns', category: 'horns', isOverride: true }
];

export const EAR_OPTIONS: FacialFeatureOption[] = [
  { id: 'none', name: 'Standard Ears', category: 'longEars' },
  { id: 'long_ears', name: 'Elven Long Ears', category: 'longEars', isOverride: true }
];

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export const HAIR_COLORS: PaletteColor[] = [
  { id: 'black', name: 'Midnight Black', hex: '#18181b' },
  { id: 'dark_brown', name: 'Dark Brown', hex: '#451a03' },
  { id: 'brown', name: 'Chestnut Brown', hex: '#78350f' },
  { id: 'light_brown', name: 'Light Brown', hex: '#b45309' },
  { id: 'blonde', name: 'Golden Blonde', hex: '#f59e0b' },
  { id: 'ash', name: 'Ash Gray', hex: '#a1a1aa' },
  { id: 'gray', name: 'Silver Gray', hex: '#d4d4d8' },
  { id: 'white', name: 'Pure White', hex: '#f4f4f5' },
  { id: 'red', name: 'Crimson Red', hex: '#dc2626' },
  { id: 'ginger', name: 'Fiery Ginger', hex: '#ea580c' },
  { id: 'orange', name: 'Vibrant Orange', hex: '#f97316' },
  { id: 'gold', name: 'Imperial Gold', hex: '#eab308' },
  { id: 'green', name: 'Forest Green', hex: '#16a34a' },
  { id: 'blue', name: 'Cobalt Blue', hex: '#2563eb' },
  { id: 'purple', name: 'Mystic Purple', hex: '#9333ea' },
  { id: 'pink', name: 'Rose Pink', hex: '#ec4899' }
];

export const BEARD_MUSTACHE_COLORS: PaletteColor[] = [
  { id: 'black', name: 'Midnight Black', hex: '#18181b' },
  { id: 'dark_brown', name: 'Dark Brown', hex: '#451a03' },
  { id: 'brown', name: 'Chestnut Brown', hex: '#78350f' },
  { id: 'light_brown', name: 'Light Brown', hex: '#b45309' },
  { id: 'blonde', name: 'Golden Blonde', hex: '#f59e0b' },
  { id: 'ash', name: 'Ash Gray', hex: '#a1a1aa' },
  { id: 'gray', name: 'Silver Gray', hex: '#d4d4d8' },
  { id: 'white', name: 'Pure White', hex: '#f4f4f5' },
  { id: 'red', name: 'Crimson Red', hex: '#dc2626' },
  { id: 'ginger', name: 'Fiery Ginger', hex: '#ea580c' },
  { id: 'orange', name: 'Vibrant Orange', hex: '#f97316' },
  { id: 'gold', name: 'Imperial Gold', hex: '#eab308' },
  { id: 'green', name: 'Forest Green', hex: '#16a34a' },
  { id: 'blue', name: 'Cobalt Blue', hex: '#2563eb' },
  { id: 'purple', name: 'Mystic Purple', hex: '#9333ea' },
  { id: 'pink', name: 'Rose Pink', hex: '#ec4899' }
];

export const HORN_COLORS: PaletteColor[] = [
  { id: 'black', name: 'Obsidian Black', hex: '#18181b' },
  { id: 'metallic_iron', name: 'Iron Metal', hex: '#52525b' },
  { id: 'metallic_bronze', name: 'Bronze Metal', hex: '#92400e' },
  { id: 'metallic_gold', name: 'Gilded Gold', hex: '#eab308' },
  { id: 'metallic_silver', name: 'Refined Silver', hex: '#e4e4e7' },
  { id: 'amber', name: 'Amber Horn', hex: '#f59e0b' },
  { id: 'bone', name: 'Bleached Bone', hex: '#fef3c7' },
  { id: 'red', name: 'Crimson Fiend', hex: '#dc2626' },
  { id: 'blue', name: 'Arcane Blue', hex: '#2563eb' },
  { id: 'purple', name: 'Demon Purple', hex: '#9333ea' },
  { id: 'green', name: 'Venom Green', hex: '#16a34a' }
];
