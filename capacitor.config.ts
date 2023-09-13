import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hratlas.app',
  appName: 'hr-payroll-ui',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
