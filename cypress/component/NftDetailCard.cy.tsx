/// <reference types="cypress" />

import '../plugins/tailwind';

import { NftDetailCard } from '../../components/modules/NFTDetail/NftDetailCard';

describe('NftDetailCard', () => {
  it('mounts with valid props', () => {
    cy.mount(
      <NftDetailCard
        type="testType"
        value="testValue"
      />
    );
    cy.contains('testType').should('exist');
    cy.contains('testValue').should('exist');
  });

  it('mounts with all props', () => {
    cy.mount(
      <NftDetailCard
        type="testType"
        value="testValue"
        subtitle='testSubtitle'
        valueClasses='testValueClasses'
      />
    );
    cy.contains('testType').should('exist');
    cy.contains('testValue').should('exist');
    cy.contains('testSubtitle').should('exist');
    cy.contains('testValue').should('have.class', 'testValueClasses');
  });

  it('calls onClick callback', () => {
    const stub = cy.stub();
    cy.mount(
      <NftDetailCard
        type="testType"
        value="testValue"
        subtitle='testSubtitle'
        valueClasses='testValueClasses'
        onClick={stub}
      />
    );
    cy.get('.NftDetailCard').click().then(() => {
      expect(stub).to.be.called;
    });
  });
});