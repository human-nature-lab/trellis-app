import { CapacitorConfig } from '@capacitor/cli'
import dotenv from 'dotenv'
dotenv.config()

const config: CapacitorConfig = {
  appId: 'edu.yale.trellis.surveyview',
  appName: 'Trellis',
  webDir: 'dist',
  server: {
    url: process.env.VITE_SERVER_URL,
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
  },
}

export default config
