const artwork = {
  terraria: {
    directory: 'pylons',
    variants: [
      'aether',
      'cavern',
      'desert',
      'forest',
      'hallow',
      'jungle',
      'mushroom',
      'ocean',
      'snow',
      'underworld',
      'universal',
    ],
    overrides: {
      anaconda: 'jungle',
      archlinux: 'snow',
      archlinuxcn: 'snow',
      debian: 'underworld',
      pypi: 'aether',
      ubuntu: 'underworld',
    } as Record<string, string>,
  },
  stardew: {
    directory: 'icons',
    variants: [
      'ancient-fruit',
      'bus-ticket',
      'cactus-fruit',
      'copper-node',
      'coral',
      'golden-walnut',
      'hardwood',
      'iridium-node',
      'junimo-icon',
    ],
    overrides: {
      anaconda: 'ancient-fruit',
      archlinux: 'iridium-node',
      archlinuxcn: 'iridium-node',
      debian: 'hardwood',
      pypi: 'golden-walnut',
      ubuntu: 'copper-node',
    } as Record<string, string>,
  },
};

/** Stable artwork across static pages, React islands, and directory listings. */
export function themeArtwork(mirrorId: string): Record<`--${string}`, string> {
  const id = mirrorId.toLowerCase();
  let hash = 2166136261;
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return Object.fromEntries(
    Object.entries(artwork).map(([theme, config]) => {
      const icon =
        config.overrides[id] ??
        config.variants[(hash >>> 0) % config.variants.length];
      return [
        `--theme-artwork-${theme}`,
        `url("/themes/${theme}/${config.directory}/${icon}.png")`,
      ];
    })
  );
}
