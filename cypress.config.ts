import codeCoverageTask from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '1gkqo9',
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },

  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      url: '/api/__coverage__',
    },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);

      return config;
    },
    retries: 1
  },
});
