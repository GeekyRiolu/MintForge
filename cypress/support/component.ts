/* eslint-disable @typescript-eslint/no-namespace */
import './commands';
import '@testing-library/cypress/add-commands';
import '@cypress/code-coverage/support';

import { mount } from 'cypress/react';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount);

// Example use:
// cy.mount(<MyComponent />)