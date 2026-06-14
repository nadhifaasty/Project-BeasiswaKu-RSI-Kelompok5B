import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: false,
    setupNodeEvents(on, config) {
      on('task', {
        seedDatabase() {
          const { execSync } = require('child_process');
          try {
            // Execute the backend full data seeding script with --transpile-only to skip strict check
            execSync('npx ts-node --transpile-only src/scripts/seed-full-data.ts', { cwd: '../backend' });
            return null;
          } catch (error: any) {
            throw new Error(`Seeding database failed: ${error.stdout?.toString() || error.message}`);
          }
        }
      });
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
});
