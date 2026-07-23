export interface TopOption {
  id: string;
  name: string;
  url: string;
  paletteType: 'fabric' | 'metal';
  genderRule: 'everyone' | 'female' | 'male' | 'teen';
  overrideWings: boolean;
}

export const TOPS_CATALOG: TopOption[] = [
  { id: 'none', name: 'None', url: '', paletteType: 'fabric', genderRule: 'everyone', overrideWings: false },
  { id: 'everyone_fabric_shirt', name: 'Shirt (Everyone)', url: '/assets/lpc/tops/everyone_fabric_shirt.png', paletteType: 'fabric', genderRule: 'everyone', overrideWings: true },
  { id: 'female_fabric_apron', name: 'Apron (Female)', url: '/assets/lpc/tops/female_fabric_apron.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_blouse', name: 'Blouse (Female)', url: '/assets/lpc/tops/female_fabric_blouse.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_chainmail', name: 'Chainmail (Female)', url: '/assets/lpc/tops/female_fabric_chainmail.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_corset', name: 'Corset (Female)', url: '/assets/lpc/tops/female_fabric_corset.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_leather_armour', name: 'Leather Armour (Female)', url: '/assets/lpc/tops/female_fabric_leather_armour.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_long_sleeve_blouse', name: 'Long Sleeve Blouse (Female)', url: '/assets/lpc/tops/female_fabric_long_sleeve_blouse.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_long_sleeve_shirt', name: 'Long Sleeve Shirt (Female)', url: '/assets/lpc/tops/female_fabric_long_sleeve_shirt.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_longsleeve_female', name: 'Longsleeve Female (Female)', url: '/assets/lpc/tops/female_fabric_longsleeve_female.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_overall', name: 'Overall (Female)', url: '/assets/lpc/tops/female_fabric_overall.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_scoop_neck', name: 'Scoop Neck (Female)', url: '/assets/lpc/tops/female_fabric_scoop_neck.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_singlet', name: 'Singlet (Female)', url: '/assets/lpc/tops/female_fabric_singlet.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_sleeveless', name: 'Sleeveless (Female)', url: '/assets/lpc/tops/female_fabric_sleeveless.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'female_fabric_steel_plate', name: 'Steel Plate (Female)', url: '/assets/lpc/tops/female_fabric_steel_plate.png', paletteType: 'fabric', genderRule: 'female', overrideWings: true },
  { id: 'male_fabric_apron', name: 'Apron (Male)', url: '/assets/lpc/tops/male_fabric_apron.png', paletteType: 'fabric', genderRule: 'male', overrideWings: true },
  { id: 'male_fabric_chainmail', name: 'Chainmail (Male)', url: '/assets/lpc/tops/male_fabric_chainmail.png', paletteType: 'fabric', genderRule: 'male', overrideWings: true },
  { id: 'male_fabric_leather_armour', name: 'Leather Armour (Male)', url: '/assets/lpc/tops/male_fabric_leather_armour.png', paletteType: 'fabric', genderRule: 'male', overrideWings: true },
  { id: 'male_fabric_longsleeve_male_clean', name: 'Longsleeve Male_Clean (Male)', url: '/assets/lpc/tops/male_fabric_longsleeve_male_clean.png', paletteType: 'fabric', genderRule: 'male', overrideWings: true },
  { id: 'male_fabric_overall', name: 'Overall (Male)', url: '/assets/lpc/tops/male_fabric_overall.png', paletteType: 'fabric', genderRule: 'male', overrideWings: true },
  { id: 'male_fabric_steel_plate', name: 'Steel Plate (Male)', url: '/assets/lpc/tops/male_fabric_steel_plate.png', paletteType: 'fabric', genderRule: 'male', overrideWings: true },
  { id: 'teen_fabric_longsleeve_teen', name: 'Longsleeve Teen (Teen)', url: '/assets/lpc/tops/teen_fabric_longsleeve_teen.png', paletteType: 'fabric', genderRule: 'teen', overrideWings: true },
  { id: 'female_metal_legion_armour', name: 'Legion Armour (Female)', url: '/assets/lpc/tops/female_metal_legion_armour.png', paletteType: 'metal', genderRule: 'female', overrideWings: true },
  { id: 'male_metal_legion_armour', name: 'Legion Armour (Male)', url: '/assets/lpc/tops/male_metal_legion_armour.png', paletteType: 'metal', genderRule: 'male', overrideWings: true },
];

export function getCompatibleTops(bodyType: string = 'male'): TopOption[] {
  return TOPS_CATALOG.filter(top => {
    if (top.id === 'none') return true;
    if (top.genderRule === 'everyone') return true;
    if (bodyType === 'female') return top.genderRule === 'female';
    if (bodyType === 'teen') return top.genderRule === 'teen';
    return top.genderRule === 'male';
  });
}