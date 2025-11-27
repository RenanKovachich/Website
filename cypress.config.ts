import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    viewportWidth: 1280,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'docs/test-reports/screens',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
