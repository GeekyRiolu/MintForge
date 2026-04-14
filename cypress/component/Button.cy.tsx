import '../plugins/tailwind';

import { Button, ButtonType } from '../../components/elements/Button';

describe('Button', () => {
  it('mounts with valid props', () => {
    const onClick = cy.stub();
    cy.mount(
      <Button
        label={'hello'}
        onClick={onClick}
        type={ButtonType.PRIMARY}
      />
    );
    cy.findByText('hello').should('exist');
    cy.findByText('hello').click().then(() => {
      expect(onClick).to.be.calledOnce;
    });
  });

  it('fills the width', () => {
    cy.viewport(320, 500);
    const onClick = cy.stub();
    cy.mount(
      <Button
        stretch
        label={'hello'}
        onClick={onClick}
        type={ButtonType.PRIMARY}
      />
    );
    cy.get('.buttonContainer').should('have.class', 'w-full');
    cy.get('.buttonContainer').invoke('outerWidth').should('be.eq', 320);
  });

  it('mounts with more props', () => {
    const onClick = cy.stub();
    cy.mount(
      <Button
        label={'hello'}
        onClick={onClick}
        type={ButtonType.PRIMARY}
        stretch
        color="red"
        bgColor='blue'
        outline="test-outline-class"
        icon={<div id="test-icon">{':)'}</div>}
      />
    );
    cy.findByText('hello').should('exist');
    cy.findByText('hello').click().then(() => {
      expect(onClick).to.be.calledOnce;
    });
    cy.findByText('hello').should('have.css', 'color', 'rgb(255, 0, 0)');
    cy.findByText('hello').should('have.css', 'backgroundColor', 'rgb(0, 0, 255)');
    cy.get('.buttonContainer') .should('have.class', 'test-outline-class');
    cy.get('#test-icon').should('exist');
  });
});