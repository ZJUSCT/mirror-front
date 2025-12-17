import * as colors from '@texel/color';
import type { PrismTheme } from 'prism-react-renderer';

/*
export interface SimplePaletteColorOptions {
  light?: string;
  main: string;
  dark?: string;
  contrastText?: string;
}
 */
function oklch(l: number, c: number, h: number): string {
  return colors.RGBToHex(colors.convert([l, c, h], colors.OKLCH, colors.sRGB));
}

const accent = [0 / 256, 63 / 256, 136 / 256];
const [accentL, accentC, accentH] = colors.convert(
  accent,
  colors.sRGB,
  colors.OKLCH
);
export const lightAccent = oklch(accentL, accentC, accentH);
export const darkAccent = oklch(1 - accentL, accentC, accentH);
export const lightSecondary = oklch(0.8, accentC / 2, accentH);
export const darkSecondary = oklch(0.4, accentC / 2, accentH);

export const tintedGrayscale: string[] = [];
export const grayscale: string[] = [];
export const steps = 24;
for (let i = 0; i < steps; i += 1) {
  const minLightness = 0.1;
  const lightness =
    minLightness + (1 - minLightness) * (1 - (1 - i / (steps - 1)));

  // from 20% to 0, quadratic reduction
  const baseChroma = 0.1;
  const minChroma = 0.007;
  const chroma =
    (baseChroma - minChroma) * ((steps - 1 - i) / (steps - 1)) ** 4 + minChroma;
  tintedGrayscale.push(oklch(lightness, chroma, accentH));

  const baseGrayChroma = 0.05;
  const minGrayChroma = 0;
  const grayChroma =
    (baseGrayChroma - minGrayChroma) * ((steps - 1 - i) / (steps - 1)) ** 4 +
    minGrayChroma;
  grayscale.push(oklch(lightness, grayChroma, accentH));
}
export const tintLight050 = oklch(1, 0, accentH);

function generateAuxColors(chroma: number, hue: number): [string, string] {
  const lightColorLightness = 0.6;
  const darkColorLightness = 0.6;
  return [
    oklch(lightColorLightness, chroma, hue),
    oklch(darkColorLightness, chroma, hue),
  ];
}

export const [lightSuccess, darkSuccess] = generateAuxColors(0.2, 170);
export const [lightErr, darkErr] = generateAuxColors(0.2, 20);
export const [lightWarn, darkWarn] = generateAuxColors(0.3, 90);
export const [lightInfo, darkInfo] = generateAuxColors(0.2, 210);
// Converted automatically using ./tools/themeFromVsCode

const lightComments = tintedGrayscale[12];
const darkComments = tintedGrayscale[12];
// const [lightKw, darkKw] = generateAuxColors(0.6, accentH);
const lightKw = oklch(0.5, 0.2, accentH); // oklch(0.5, 0.2, 200);
const darkKw = oklch(0.7, 0.2, accentH);
const lightTag = oklch(0.5, 0.2, 315);
const darkTag = oklch(0.7, 0.2, 315);
const lightVar = oklch(0.5, 0.2, accentH); // teal
const darkVar = oklch(0.7, 0.2, accentH); // teal
const lightConst = oklch(0.5, 0.2, 170);
const darkConst = oklch(0.7, 0.2, 170);

const lightInserted = oklch(0.4, 0.2, 170); // green
const darkInserted = oklch(0.7, 0.2, 200); // teal
const lightDeleted = oklch(0.4, 0.2, 0); // red
const darkDeleted = oklch(0.7, 0, 30); // orange
export const lightTheme: PrismTheme = {
  plain: {
    color: grayscale[0],
    backgroundColor: tintedGrayscale[steps - 2],
  },
  styles: [
    {
      types: ['comment'],
      style: {
        color: lightComments,
        fontStyle: 'italic',
      },
    },
    {
      types: [
        'builtin',
        'changed',
        'keyword',
        'interpolation-punctuation',
        'key',
      ],
      style: {
        color: lightKw,
      },
    },
    {
      types: ['inserted'],
      style: {
        color: lightInserted,
      },
    },
    {
      types: ['constant', 'number', 'string', 'char', 'boolean'],
      style: {
        color: lightConst,
      },
    },
    {
      types: ['attr-name', 'variable'],
      style: {
        color: lightVar,
      },
    },
    {
      types: ['deleted'],
      style: {
        color: lightDeleted,
      },
    },

    // {
    //   // Fix tag color
    //   types: ['tag'],
    //   style: {
    //     color: 'rgb(78, 201, 176)',
    //   },
    // },
    // {
    //   // Fix tag color for HTML
    //   types: ['tag'],
    //   languages: ['markup'],
    //   style: {
    //     color: lightTag,
    //   },
    // },
    {
      types: ['punctuation', 'template-punctuation', 'operator'],
      style: {
        color: grayscale[8],
      },
    },
    {
      // Fix punctuation color for HTML
      types: ['punctuation'],
      languages: ['markup'],
      style: {
        color: grayscale[8],
      },
    },
    {
      types: ['function', 'class-name', 'selector'],
      style: {
        color: lightTag,
      },
    },
  ],
};

export const darkTheme: PrismTheme = {
  plain: {
    color: tintedGrayscale[steps - 2],
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  styles: [
    {
      types: ['comment'],
      style: {
        color: darkComments,
        fontStyle: 'italic',
      },
    },
    {
      types: [
        'builtin',
        'changed',
        'keyword',
        'interpolation-punctuation',
        'key',
      ],
      style: {
        color: darkKw,
      },
    },
    {
      types: ['inserted'],
      style: {
        color: darkInserted,
      },
    },
    {
      types: ['constant', 'number', 'string', 'char', 'boolean'],
      style: {
        color: darkConst,
      },
    },
    {
      types: ['attr-name', 'variable'],
      style: {
        color: darkVar,
      },
    },
    {
      types: ['deleted'],
      style: {
        color: darkDeleted,
      },
    },
    {
      types: ['punctuation', 'template-punctuation', 'operator'],
      style: {
        color: tintedGrayscale[16],
      },
    },
    {
      // Fix punctuation color for HTML
      types: ['punctuation'],
      languages: ['markup'],
      style: {
        color: tintedGrayscale[8],
      },
    },
    {
      types: ['function', 'class-name', 'selector'],
      style: {
        color: darkTag,
      },
    },
  ],
};
