export interface HelmetOption {
  id: string;
  name: string;
  url: string;
  paletteType: 'fabric' | 'metal';
  gender: 'male' | 'female' | 'unisex';
  overrideHair: boolean;
  overrideEars: boolean;
  overrideHorns: boolean;
  overrideFacialHair: boolean;
  overrideGlasses: boolean;
}

export const HELMETS_CATALOG: HelmetOption[] = [
  { id: 'none', name: 'None', url: '', paletteType: 'metal', gender: 'unisex', overrideHair: false, overrideEars: false, overrideHorns: false, overrideFacialHair: false, overrideGlasses: false },
  { id: 'baseball_cap', name: 'Baseball Cap', url: '/assets/lpc/helmets/baseball_cap.png', paletteType: 'fabric', gender: 'unisex', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: false, overrideGlasses: false },
  { id: 'peaked_cap', name: 'Peaked Cap', url: '/assets/lpc/helmets/peaked_cap.png', paletteType: 'fabric', gender: 'unisex', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: false, overrideGlasses: false },
  { id: 'female_moon-female', name: 'Moon', url: '/assets/lpc/helmets/female_moon-female.png', paletteType: 'fabric', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: false, overrideGlasses: false },
  { id: 'female_nomoon-female', name: 'Nomoon', url: '/assets/lpc/helmets/female_nomoon-female.png', paletteType: 'fabric', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: false, overrideGlasses: false },
  { id: 'male_moon-male', name: 'Moon', url: '/assets/lpc/helmets/male_moon-male.png', paletteType: 'fabric', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: false, overrideGlasses: false },
  { id: 'male_nomoon-male', name: 'Nomoon', url: '/assets/lpc/helmets/male_nomoon-male.png', paletteType: 'fabric', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: false, overrideGlasses: false },
  { id: 'female_barbarian-female', name: 'Barbarian', url: '/assets/lpc/helmets/female_barbarian-female.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_barbuta-female', name: 'Barbuta', url: '/assets/lpc/helmets/female_barbuta-female.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_bascinet_plumage', name: 'Bascinet, Plumage', url: '/assets/lpc/helmets/female_bascinet_plumage.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_bascinet_raised_plumage', name: 'Bascinet, Raised, Plumage', url: '/assets/lpc/helmets/female_bascinet_raised_plumage.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_bascinet_raised', name: 'Bascinet, Raised', url: '/assets/lpc/helmets/female_bascinet_raised.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_bascinet', name: 'Bascinet', url: '/assets/lpc/helmets/female_bascinet.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_maximus-female', name: 'Maximus', url: '/assets/lpc/helmets/female_maximus-female.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_morion_faceplate_plumage', name: 'Morion, Faceplate, Plumage', url: '/assets/lpc/helmets/female_morion_faceplate_plumage.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_morion_faceplate', name: 'Morion, Faceplate', url: '/assets/lpc/helmets/female_morion_faceplate.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_morion_plumage', name: 'Morion, Plumage', url: '/assets/lpc/helmets/female_morion_plumage.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_morion', name: 'Morion', url: '/assets/lpc/helmets/female_morion.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'female_norman', name: 'Norman', url: '/assets/lpc/helmets/female_norman.png', paletteType: 'metal', gender: 'female', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_barbarian-male', name: 'Barbarian', url: '/assets/lpc/helmets/male_barbarian-male.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_barbuta-male', name: 'Barbuta', url: '/assets/lpc/helmets/male_barbuta-male.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_bascinet_plumage', name: 'Bascinet, Plumage', url: '/assets/lpc/helmets/male_bascinet_plumage.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_bascinet_raised_plumage', name: 'Bascinet, Raised, Plumage', url: '/assets/lpc/helmets/male_bascinet_raised_plumage.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_bascinet_raised', name: 'Bascinet, Raised', url: '/assets/lpc/helmets/male_bascinet_raised.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_bascinet', name: 'Bascinet', url: '/assets/lpc/helmets/male_bascinet.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_maximus-male', name: 'Maximus', url: '/assets/lpc/helmets/male_maximus-male.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_morion_faceplate_plumage', name: 'Morion, Faceplate, Plumage', url: '/assets/lpc/helmets/male_morion_faceplate_plumage.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_morion_faceplate', name: 'Morion, Faceplate', url: '/assets/lpc/helmets/male_morion_faceplate.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_morion_plumage', name: 'Morion, Plumage', url: '/assets/lpc/helmets/male_morion_plumage.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_morion', name: 'Morion', url: '/assets/lpc/helmets/male_morion.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
  { id: 'male_norman', name: 'Norman', url: '/assets/lpc/helmets/male_norman.png', paletteType: 'metal', gender: 'male', overrideHair: true, overrideEars: true, overrideHorns: true, overrideFacialHair: true, overrideGlasses: true },
];

export function getCompatibleHelmets(bodyType: string = 'male'): HelmetOption[] {
  const gender = bodyType === 'female' ? 'female' : 'male';
  return HELMETS_CATALOG.filter(h => h.id === 'none' || h.gender === 'unisex' || h.gender === gender);
}
