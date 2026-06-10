import { config as defaultConfig } from '@gluestack-ui/config';

export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens?.colors,
      primary600: '#800020', // Maps Gluestack primary buttons to your Burgundy
      secondary500: '#D4AF37', // Maps secondary to your Gold
      backgroundLight50: '#FDFBF7', // Luxury background
    },
    radii: {
      ...defaultConfig.tokens?.radii,
      'xl': 16, // Overrides large radius to match your 16px requirement
    },
  },
};
