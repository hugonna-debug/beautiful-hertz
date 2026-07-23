export interface PantsOption {
  id: string;
  name: string;
  urlEveryone: string;
  urlMuscular: string;
}

export const PANTS_CATALOG: PantsOption[] = [
  { id: 'none', name: 'None', urlEveryone: '', urlMuscular: '' },
  { id: 'pants_standard', name: 'Standard Pants', urlEveryone: '/assets/lpc/legs/pants_everyone.png', urlMuscular: '/assets/lpc/legs/pants_muscular.png' }
];

export function getPantsFileUrl(pantsId: string = 'pants_standard', bodyType: string = 'male'): string {
  const item = PANTS_CATALOG.find(p => p.id === pantsId);
  if (!item || item.id === 'none') return '';
  if (bodyType === 'muscular') {
    return item.urlMuscular;
  }
  return item.urlEveryone;
}
