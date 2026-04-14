/// <reference types="cypress" />

import { useOutsideClickAlerter } from '../../../hooks/useOutsideClickAlerter';

import { useRef, useState } from 'react';

const TestComponent = () => {
  const ref = useRef();
  const [clicked, setClicked] = useState(false);

  // listen for clicks outside of the inner component (ref)
  useOutsideClickAlerter(ref, () => {
    setClicked(true);
  });

  return <div
    id="container"
    style={{
      height: 400,
      width: 400,
      display: 'flex',
      backgroundColor: 'yellow'
    }}>
    <div id="result">{clicked + ''}</div>
    <div id="inside" ref={ref} style={{ height: 50, width: 50, backgroundColor: 'red' }}>inside</div>
  </div>;
};

describe('useOutsideClickAlerter', () => {
  it('should callback when container is clicked', () => {
    cy.mount(
      <TestComponent />
    );
    
    cy.get('#container').click();
    cy.get('#result').should('contain', 'true');
  });

  it('should not callback when inner ref is clicked', () => {
    cy.mount(
      <TestComponent />
    );
    
    cy.get('#inside').click();
    cy.get('#result').should('contain', 'false');
  });
});