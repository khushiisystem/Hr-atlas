import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hratlas.app',
  appName: 'HR-Atlas',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
