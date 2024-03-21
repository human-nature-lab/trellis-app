import { ThemeOptions, VuetifyThemeVariant } from 'vuetify/types/services/theme'

const colors = {
  primary: '#cc4115',
  secondary: '#FFCCBC',
  accent: '#78909c',
  error: '#DD2C00',
  warning: '#F2C078',
  info: '#3E7CB1',
  background: '#F5F5F5',
  success: '#93C0A4',
} as VuetifyThemeVariant
const darkColors = {
  ...colors,
  background: '#2E3532',
} as VuetifyThemeVariant

export default {
  dark: false,
  themes: {
    light: colors,
    dark: darkColors,
  },
} as ThemeOptions
