export interface WingOption {
  id: string;
  name: string;
  bgUrl: string;
  fgUrl: string;
  overrideTops: boolean;
  overrideCapes: boolean;
}

export const WINGS_CATALOG: WingOption[] = [
  { id: 'none', name: 'None', bgUrl: '', fgUrl: '', overrideTops: false, overrideCapes: false },
  { id: 'bird_normal', name: 'Feathered Wings', bgUrl: '/assets/lpc/wings/bird_normal_bg.png', fgUrl: '/assets/lpc/wings/bird_normal_fg.png', overrideTops: true, overrideCapes: true },
  { id: 'bat_normal', name: 'Bat Wings', bgUrl: '/assets/lpc/wings/bat_normal_bg.png', fgUrl: '/assets/lpc/wings/bat_normal_fg.png', overrideTops: true, overrideCapes: true },
  { id: 'bat_prestige', name: 'Prestige Bat Wings', bgUrl: '/assets/lpc/wings/bat_prestige_bg.png', fgUrl: '/assets/lpc/wings/bat_prestige_fg.png', overrideTops: true, overrideCapes: true },
  { id: 'reptile_normal', name: 'Dragon Wings', bgUrl: '/assets/lpc/wings/reptile_normal_bg.png', fgUrl: '/assets/lpc/wings/reptile_normal_fg.png', overrideTops: true, overrideCapes: true },
  { id: 'reptile_prestige', name: 'Prestige Dragon Wings', bgUrl: '/assets/lpc/wings/reptile_prestige_bg.png', fgUrl: '/assets/lpc/wings/reptile_prestige_fg.png', overrideTops: true, overrideCapes: true },
];