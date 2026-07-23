// Asset Preloader Utility for 100% Offline & Instant Sprite Loading

export interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percent: number;
  currentAsset: string;
  isComplete: boolean;
}

export const preloadAllGameAssets = async (
  onProgress?: (progress: PreloadProgress) => void
): Promise<PreloadProgress> => {
  const assetUrls: string[] = [];

  // 1. Collect Core Audio & UI Assets
  const coreAssets = [
    '/assets/music/awesomeness.wav',
    '/assets/sfx/levelup/levelcompletesplash.mp3',
    '/assets/sfx/combat/Socapex - big punch.wav',
    '/assets/sfx/combat/Socapex - small knock.wav'
  ];
  assetUrls.push(...coreAssets);

  // 2. Fetch minMaxLookup maps
  try {
    const { ENEMY_SPECIES_MAP, FALLBACK_ENEMY_SPRITES, BODY_ARMOR_SPRITES, BOOTS_SPRITES, WEAPON_SPRITES } = await import('../data/minMaxLookup');
    assetUrls.push(...Object.values(ENEMY_SPECIES_MAP));
    assetUrls.push(...FALLBACK_ENEMY_SPRITES);
    assetUrls.push(...BODY_ARMOR_SPRITES);
    assetUrls.push(...BOOTS_SPRITES);
    assetUrls.push(...WEAPON_SPRITES);
  } catch (err) {
    console.warn('AssetPreloader: Failed to import minMaxLookup for pre-caching', err);
  }

  // Remove duplicates
  const uniqueUrls = Array.from(new Set(assetUrls));
  let loaded = 0;
  let failed = 0;
  const total = uniqueUrls.length;

  return new Promise(resolve => {
    if (total === 0) {
      const p = { total: 0, loaded: 0, failed: 0, percent: 100, currentAsset: '', isComplete: true };
      onProgress?.(p);
      resolve(p);
      return;
    }

    uniqueUrls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        const percent = Math.floor(((loaded + failed) / total) * 100);
        const p = { total, loaded, failed, percent, currentAsset: url, isComplete: (loaded + failed) === total };
        onProgress?.(p);
        if (loaded + failed === total) resolve(p);
      };
      img.onerror = () => {
        failed++;
        const percent = Math.floor(((loaded + failed) / total) * 100);
        const p = { total, loaded, failed, percent, currentAsset: url, isComplete: (loaded + failed) === total };
        onProgress?.(p);
        if (loaded + failed === total) resolve(p);
      };
      img.src = url;
    });
  });
};
