/// <reference types="cypress" />

import useOnViewPort from '../../../hooks/useOnViewPort';

import { useRef } from 'react';

interface TestComponentProps {
  height: number
}

const TestComponent = (props: TestComponentProps) => {
  const ref = useRef();
  const [isVisible] = useOnViewPort(ref, 0);

  return <div id="container" style={{ height: props.height, display: 'flex', flexDirection: 'column', justifyContent: 'end', borderColor: 'black', borderWidth: 1 }}>
    <div ref={ref} style={{ height: 10, display: 'flex' }} id="isVisible">{isVisible + ''}</div>
  </div>;
};

describe('useOnViewPort', () => {
  beforeEach(() => {
    cy.viewport(500, 500);
  });

  it('should not be visible if below the fold', () => {
    cy.mount(<TestComponent height={1000} />);
    cy.get('#isVisible').should('have.text', 'false');
  });
  
  it('should be visible if above the fold', () => {
    cy.mount(<TestComponent height={10} />);
    cy.get('#isVisible').should('have.text', 'true');
  });

  it('should be visible if scrolled', () => {
    cy.mount(<TestComponent height={1000} />);
    cy.scrollTo(0, 1000).then(() => {
      cy.get('#isVisible').should('have.text', 'true');
    });
  });
});