export interface CapeOption {
  id: string;
  name: string;
  url: string;
  genderRule: 'everyone' | 'female';
  overrideWings: boolean;
}

export const CAPES_CATALOG: CapeOption[] = [
  { id: 'none', name: 'None', url: '', genderRule: 'everyone', overrideWings: false },
  { id: 'cape_everyone', name: 'Standard Cape', url: '/assets/lpc/capes/cape_everyone.png', genderRule: 'everyone', overrideWings: true },
  { id: 'cape_female', name: 'Female Cape', url: '/assets/lpc/capes/cape_female.png', genderRule: 'female', overrideWings: true },
  { id: 'cape_tattered', name: 'Tattered Cape', url: '/assets/lpc/capes/cape_tattered.png', genderRule: 'everyone', overrideWings: true }
];

export function getCompatibleCapes(bodyType: string = 'male'): CapeOption[] {
  return CAPES_CATALOG.filter(cape => {
    if (cape.id === 'none') return true;
    if (cape.genderRule === 'everyone') return true;
    if (bodyType === 'female') return cape.genderRule === 'female';
    return false;
  });
}
