import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hratlas.app',
  appName: 'HR-Atlas',
  webDir: 'www',
  server: {
    androidScheme: 'http'
  }
};

export default config;
