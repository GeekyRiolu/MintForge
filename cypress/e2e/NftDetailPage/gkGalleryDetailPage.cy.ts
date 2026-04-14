/// <reference types="cypress" />

describe('gk gallery detail page tests', () => {
  const generateRandomNumber = (min: number, max: number) => {
    const _min: number = Math.ceil(min);
    const _max: number = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  beforeEach(() => {
    cy.viewport(550, 750);
  });

  it('id > 10000', () => {
    cy.visit('/app/gallery/100001');
    cy.get('.text-primary-txt').should('exist').and('include.text', 'This Genesis Key');
    cy.contains('Back to Gallery').should('exist');
    cy.get('.drop-shadow-md > .flex').should('exist').click();
    cy.wait(2000);
    cy.url().should('not.include', '100001');
  });

  it('id === 0', () => {
    cy.visit('/app/gallery/0');
    cy.get('.text-primary-txt').should('exist').and('include.text', 'This Genesis Key');
    cy.contains('Back to Gallery').should('exist');
    cy.get('.drop-shadow-md > .flex').should('exist').click();
    cy.wait(2000);
    cy.url().should('not.include', '/0');
  });

  it('id < 0', () => {
    cy.visit('/app/gallery/-1');
    cy.get('.text-primary-txt').should('exist').and('include.text', 'This Genesis Key');
    cy.contains('Back to Gallery').should('exist');
    cy.get('.drop-shadow-md > .flex').should('exist').click();
    cy.wait(2000);
    cy.url().should('not.include', '-1');
  });

  it('id NaN', () => {
    cy.visit('/app/gallery/notanumber');
    cy.get('.text-primary-txt').should('exist').and('include.text', 'This Genesis Key');
    cy.contains('Back to Gallery').should('exist');
    cy.get('.drop-shadow-md > .flex').should('exist').click();
    cy.wait(2000);
    cy.url().should('not.include', 'notanumber');
  });

  it('visit valid gk', () => {
    const id = generateRandomNumber(1, 10000);
    cy.visit(`/app/gallery/${id}`);
    cy.get('.text-5xl').should('exist').and('include.text', `${id}`);
  });
});