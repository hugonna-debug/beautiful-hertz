export interface RingSpriteInfo {
  name: string;
  col: number;
  row: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export const RING_CATALOG: RingSpriteInfo[] = [
  // --- ROW 0: Crowned & Ribbed Rings ---
  { name: 'Silver Crown Band', col: 0, row: 0, rarity: 'common' },
  { name: 'Cyan Crystal Crown Ring', col: 1, row: 0, rarity: 'rare' },
  { name: 'Cobalt Crown Ring', col: 2, row: 0, rarity: 'rare' },
  { name: 'Royal Blue Crown Ring', col: 3, row: 0, rarity: 'epic' },
  { name: 'Amethyst Sovereign Ring', col: 4, row: 0, rarity: 'epic' },
  { name: 'Ruby Sovereign Ring', col: 5, row: 0, rarity: 'epic' },
  { name: 'Imperial Gold Crown Ring', col: 6, row: 0, rarity: 'legendary' },
  { name: 'Emerald Sovereign Ring', col: 7, row: 0, rarity: 'legendary' },
  { name: 'Steel Ribbed Ring', col: 8, row: 0, rarity: 'common' },
  { name: 'Gilded Ribbed Band', col: 9, row: 0, rarity: 'rare' },
  { name: 'Crimson Ribbed Ring', col: 10, row: 0, rarity: 'rare' },
  { name: 'Solar Ribbed Band', col: 11, row: 0, rarity: 'rare' },
  { name: 'Verdant Ribbed Ring', col: 12, row: 0, rarity: 'epic' },
  { name: 'Cyan Ribbed Band', col: 13, row: 0, rarity: 'epic' },
  { name: 'Sapphire Ribbed Ring', col: 14, row: 0, rarity: 'epic' },
  { name: 'Amethyst Ribbed Band', col: 15, row: 0, rarity: 'legendary' },

  // --- ROW 1: Dragon Scale & Serpent Bands ---
  { name: 'Silver Dragonscale Ring', col: 0, row: 1, rarity: 'rare' },
  { name: 'Golden Dragonscale Ring', col: 1, row: 1, rarity: 'epic' },
  { name: 'Crimson Dragonscale Ring', col: 2, row: 1, rarity: 'epic' },
  { name: 'Solar Dragonscale Ring', col: 3, row: 1, rarity: 'rare' },
  { name: 'Verdant Dragonscale Ring', col: 4, row: 1, rarity: 'epic' },
  { name: 'Cyan Dragonscale Ring', col: 5, row: 1, rarity: 'epic' },
  { name: 'Sapphire Dragonscale Ring', col: 6, row: 1, rarity: 'legendary' },
  { name: 'Amethyst Dragonscale Ring', col: 7, row: 1, rarity: 'legendary' },
  { name: 'Silver Serpent Band', col: 8, row: 1, rarity: 'common' },
  { name: 'Golden Serpent Band', col: 9, row: 1, rarity: 'rare' },
  { name: 'Crimson Serpent Band', col: 10, row: 1, rarity: 'rare' },
  { name: 'Solar Serpent Band', col: 11, row: 1, rarity: 'rare' },
  { name: 'Verdant Serpent Band', col: 12, row: 1, rarity: 'epic' },
  { name: 'Cyan Serpent Band', col: 13, row: 1, rarity: 'epic' },
  { name: 'Sapphire Serpent Band', col: 14, row: 1, rarity: 'epic' },
  { name: 'Amethyst Serpent Band', col: 15, row: 1, rarity: 'legendary' },

  // --- ROW 2: Ruby / Crimson Gem-Inlaid Rings ---
  { name: 'Ruby Spiral Ring', col: 0, row: 2, rarity: 'rare' },
  { name: 'Ruby Orb Ring', col: 1, row: 2, rarity: 'rare' },
  { name: 'Ruby Serpent Ring', col: 2, row: 2, rarity: 'epic' },
  { name: 'Crimson Signet Ring', col: 3, row: 2, rarity: 'rare' },
  { name: 'Ruby Solitaire Ring', col: 4, row: 2, rarity: 'epic' },
  { name: 'Red Wave Band', col: 5, row: 2, rarity: 'rare' },
  { name: 'Crimson Emblem Ring', col: 6, row: 2, rarity: 'rare' },
  { name: 'Ruby Rune Ring', col: 7, row: 2, rarity: 'epic' },
  { name: 'Ruby Square Ring', col: 8, row: 2, rarity: 'epic' },
  { name: 'Ruby Filigree Ring', col: 9, row: 2, rarity: 'legendary' },
  { name: 'Red Helix Ring', col: 10, row: 2, rarity: 'rare' },
  { name: 'Rose Gold Band', col: 11, row: 2, rarity: 'common' },
  { name: 'Ruby Dome Ring', col: 15, row: 2, rarity: 'epic' },

  // --- ROW 3: Gold Gem-Inlaid Rings ---
  { name: 'Gold Ruby Orb Ring', col: 0, row: 3, rarity: 'epic' },
  { name: 'Gold Sapphire Orb Ring', col: 1, row: 3, rarity: 'epic' },
  { name: 'Gold Serpent Ring', col: 2, row: 3, rarity: 'epic' },
  { name: 'Gold Signet Ring', col: 3, row: 3, rarity: 'rare' },
  { name: 'Gold Diamond Solitaire', col: 4, row: 3, rarity: 'legendary' },
  { name: 'Gold Wave Ring', col: 5, row: 3, rarity: 'rare' },
  { name: 'Gold Emblem Ring', col: 6, row: 3, rarity: 'rare' },
  { name: 'Gold Emerald Rune Ring', col: 7, row: 3, rarity: 'legendary' },
  { name: 'Gold Sapphire Square Ring', col: 8, row: 3, rarity: 'legendary' },
  { name: 'Gold Filigree Ring', col: 9, row: 3, rarity: 'epic' },
  { name: 'Gold Helix Ring', col: 10, row: 3, rarity: 'rare' },
  { name: 'Gold Band Ring', col: 11, row: 3, rarity: 'common' },

  // --- ROW 4: Cyan Gem-Inlaid Rings ---
  { name: 'Cyan Ruby Orb Ring', col: 0, row: 4, rarity: 'rare' },
  { name: 'Cyan Sapphire Orb Ring', col: 1, row: 4, rarity: 'rare' },
  { name: 'Cyan Serpent Ring', col: 2, row: 4, rarity: 'epic' },
  { name: 'Cyan Signet Ring', col: 3, row: 4, rarity: 'rare' },
  { name: 'Cyan Diamond Solitaire', col: 4, row: 4, rarity: 'epic' },
  { name: 'Cyan Wave Ring', col: 5, row: 4, rarity: 'common' },
  { name: 'Cyan Emblem Ring', col: 6, row: 4, rarity: 'rare' },
  { name: 'Cyan Emerald Rune Ring', col: 7, row: 4, rarity: 'epic' },
  { name: 'Cyan Sapphire Square Ring', col: 8, row: 4, rarity: 'epic' },
  { name: 'Cyan Filigree Ring', col: 9, row: 4, rarity: 'legendary' },
  { name: 'Cyan Helix Ring', col: 10, row: 4, rarity: 'rare' },
  { name: 'Cyan Band Ring', col: 11, row: 4, rarity: 'common' },

  // --- ROW 5: Cobalt / Sapphire Gem-Inlaid Rings ---
  { name: 'Cobalt Ruby Orb Ring', col: 0, row: 5, rarity: 'rare' },
  { name: 'Cobalt Sapphire Orb Ring', col: 1, row: 5, rarity: 'epic' },
  { name: 'Cobalt Serpent Ring', col: 2, row: 5, rarity: 'epic' },
  { name: 'Cobalt Signet Ring', col: 3, row: 5, rarity: 'rare' },
  { name: 'Cobalt Diamond Solitaire', col: 4, row: 5, rarity: 'legendary' },
  { name: 'Cobalt Wave Ring', col: 5, row: 5, rarity: 'common' },
  { name: 'Cobalt Emblem Ring', col: 6, row: 5, rarity: 'rare' },
  { name: 'Cobalt Emerald Rune Ring', col: 7, row: 5, rarity: 'epic' },
  { name: 'Cobalt Sapphire Square Ring', col: 8, row: 5, rarity: 'legendary' },
  { name: 'Cobalt Filigree Ring', col: 9, row: 5, rarity: 'epic' },
  { name: 'Cobalt Helix Ring', col: 10, row: 5, rarity: 'rare' },
  { name: 'Cobalt Band Ring', col: 11, row: 5, rarity: 'common' },
  { name: 'Silver Diamond Solitaire Ring', col: 13, row: 5, rarity: 'epic' },
  { name: 'Gold Diamond Signet Ring', col: 14, row: 5, rarity: 'legendary' },

  // --- ROW 6: Silver Gem-Inlaid Rings ---
  { name: 'Silver Ruby Orb Ring', col: 0, row: 6, rarity: 'common' },
  { name: 'Silver Sapphire Orb Ring', col: 1, row: 6, rarity: 'rare' },
  { name: 'Silver Serpent Ring', col: 2, row: 6, rarity: 'rare' },
  { name: 'Silver Signet Ring', col: 3, row: 6, rarity: 'common' },
  { name: 'Silver Diamond Solitaire', col: 4, row: 6, rarity: 'rare' },
  { name: 'Silver Wave Ring', col: 5, row: 6, rarity: 'common' },
  { name: 'Silver Emblem Ring', col: 6, row: 6, rarity: 'common' },
  { name: 'Silver Emerald Rune Ring', col: 7, row: 6, rarity: 'rare' },
  { name: 'Silver Sapphire Square Ring', col: 8, row: 6, rarity: 'epic' },
  { name: 'Silver Filigree Ring', col: 9, row: 6, rarity: 'rare' },
  { name: 'Silver Helix Ring', col: 10, row: 6, rarity: 'common' },
  { name: 'Silver Band Ring', col: 11, row: 6, rarity: 'common' },
  { name: 'Sapphire Star Ring', col: 13, row: 6, rarity: 'epic' },
  { name: 'Topaz Star Ring', col: 14, row: 6, rarity: 'rare' },
  { name: 'Ruby Star Ring', col: 15, row: 6, rarity: 'epic' },

  // --- ROW 7: Gold Gem Star / Solitaire Rings ---
  { name: 'Gold Sapphire Star Ring', col: 13, row: 7, rarity: 'legendary' },
  { name: 'Gold Topaz Star Ring', col: 14, row: 7, rarity: 'epic' },
  { name: 'Gold Ruby Star Ring', col: 15, row: 7, rarity: 'legendary' },

  // --- ROW 8..11: Dual-Tone Inlaid Band Rings ---
  { name: 'White Gold Inlaid Band', col: 0, row: 8, rarity: 'common' },
  { name: 'Yellow Gold Inlaid Band', col: 1, row: 8, rarity: 'rare' },
  { name: 'Rose Gold Inlaid Band', col: 2, row: 8, rarity: 'rare' },
  { name: 'Emerald Inlaid Ring', col: 4, row: 8, rarity: 'rare' },
  { name: 'Cyan Inlaid Ring', col: 5, row: 8, rarity: 'rare' },
  { name: 'Amethyst Inlaid Ring', col: 6, row: 8, rarity: 'epic' },
  { name: 'Crimson Inlaid Steel Band', col: 2, row: 9, rarity: 'rare' },
  { name: 'Bloodstone Inlaid Ring', col: 5, row: 9, rarity: 'epic' },
  { name: 'Garnet Inlaid Band', col: 6, row: 9, rarity: 'epic' },
  { name: 'Aquamarine Inlaid Ring', col: 1, row: 10, rarity: 'rare' },
  { name: 'Turquoise Inlaid Ring', col: 2, row: 10, rarity: 'rare' },
  { name: 'Seafoam Inlaid Band', col: 4, row: 10, rarity: 'epic' },
  { name: 'Celestial Blue Inlaid Ring', col: 1, row: 11, rarity: 'rare' },
  { name: 'Royal Cobalt Inlaid Band', col: 3, row: 11, rarity: 'epic' },
  { name: 'Deep Ocean Inlaid Ring', col: 5, row: 11, rarity: 'legendary' },

  // --- ROW 12: Eyeball / Dragon Eye Rings (Silver Band) ---
  { name: 'Black Onyx Eye Ring', col: 0, row: 12, rarity: 'rare' },
  { name: 'Tiger Eye Ring', col: 1, row: 12, rarity: 'rare' },
  { name: 'Fire Eye Ring', col: 2, row: 12, rarity: 'epic' },
  { name: 'Solar Eye Ring', col: 3, row: 12, rarity: 'epic' },
  { name: 'Venom Eye Ring', col: 4, row: 12, rarity: 'epic' },
  { name: 'Ice Eye Ring', col: 5, row: 12, rarity: 'epic' },
  { name: 'Cosmic Eye Ring', col: 6, row: 12, rarity: 'legendary' },
  { name: 'Void Eye Ring', col: 7, row: 12, rarity: 'legendary' },
  { name: 'Silver Dragon Eye Ring', col: 8, row: 12, rarity: 'rare' },
  { name: 'Gold Dragon Eye Ring', col: 9, row: 12, rarity: 'epic' },
  { name: 'Crimson Dragon Eye Ring', col: 10, row: 12, rarity: 'epic' },
  { name: 'Solar Dragon Eye Ring', col: 11, row: 12, rarity: 'epic' },
  { name: 'Venom Dragon Eye Ring', col: 12, row: 12, rarity: 'epic' },
  { name: 'Cyan Dragon Eye Ring', col: 13, row: 12, rarity: 'epic' },
  { name: 'Cobalt Dragon Eye Ring', col: 14, row: 12, rarity: 'legendary' },
  { name: 'Void Dragon Eye Ring', col: 15, row: 12, rarity: 'legendary' },

  // --- ROW 13: Eyeball / Dragon Eye Rings (Cobalt Band) ---
  { name: 'Cobalt Onyx Eye Ring', col: 0, row: 13, rarity: 'rare' },
  { name: 'Cobalt Tiger Eye Ring', col: 1, row: 13, rarity: 'rare' },
  { name: 'Cobalt Fire Eye Ring', col: 2, row: 13, rarity: 'epic' },
  { name: 'Cobalt Solar Eye Ring', col: 3, row: 13, rarity: 'epic' },
  { name: 'Cobalt Venom Eye Ring', col: 4, row: 13, rarity: 'epic' },
  { name: 'Cobalt Ice Eye Ring', col: 5, row: 13, rarity: 'epic' },
  { name: 'Cobalt Cosmic Eye Ring', col: 6, row: 13, rarity: 'legendary' },
  { name: 'Cobalt Void Eye Ring', col: 7, row: 13, rarity: 'legendary' },

  // --- ROW 14: Eyeball / Dragon Eye Rings (Gold Band) ---
  { name: 'Gold Onyx Eye Ring', col: 0, row: 14, rarity: 'epic' },
  { name: 'Gold Tiger Eye Ring', col: 1, row: 14, rarity: 'epic' },
  { name: 'Gold Fire Eye Ring', col: 2, row: 14, rarity: 'epic' },
  { name: 'Gold Solar Eye Ring', col: 3, row: 14, rarity: 'epic' },
  { name: 'Gold Venom Eye Ring', col: 4, row: 14, rarity: 'legendary' },
  { name: 'Gold Ice Eye Ring', col: 5, row: 14, rarity: 'legendary' },
  { name: 'Gold Cosmic Eye Ring', col: 6, row: 14, rarity: 'legendary' },
  { name: 'Gold Void Eye Ring', col: 7, row: 14, rarity: 'legendary' }
];

// Helper to look up ring sprite info by item name or hash
export function getRingSpriteInfo(name: string): { col: number; row: number } {
  const cleanName = name.trim().toLowerCase();
  const match = RING_CATALOG.find(r => r.name.toLowerCase() === cleanName);
  if (match) {
    return { col: match.col, row: match.row };
  }

  // Fallback hash mapping to ensure every dynamically generated ring name matches a sprite on the sheet
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % RING_CATALOG.length;
  const entry = RING_CATALOG[idx];
  return { col: entry.col, row: entry.row };
}
