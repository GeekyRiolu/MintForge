/// <reference types="cypress" />

import useWindowDimensions from '../../../hooks/useWindowDimensions';

const TestComponent = () => {
  const { width, height } = useWindowDimensions();

  return <div>
    <div id="width">{width}</div>
    <div id="height">{height}</div>
  </div>;
};

describe('useWindowDimensions', () => {
  it('should get the correct window dimensions', () => {
    cy.viewport(550, 750);
    cy.mount(
      <TestComponent />
    );
    cy.get('#width').should('have.text', '550');
    cy.get('#height').should('have.text', '750');

    cy.viewport(600, 750);
    cy.get('#width').should('have.text', '600');
    cy.get('#height').should('have.text', '750');
  });
});