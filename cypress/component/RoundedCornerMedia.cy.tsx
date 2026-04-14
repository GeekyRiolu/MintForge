import { RoundedCornerMedia, RoundedCornerVariant } from '../../components/elements/RoundedCornerMedia';

describe('RoundedCornerMedia', () => {
  it('mounts with valid props', () => {
    cy.mount(
      <RoundedCornerMedia
        src="test.mp4"
        variant={RoundedCornerVariant.All}
      />
    );
    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.class', 'rounded-3xl');
  });

  it('mounts with valid props', () => {
    cy.mount(
      <RoundedCornerMedia
        src="test.png"
        variant={RoundedCornerVariant.All}
      />
    );
    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.class', 'rounded-3xl');
  });

  it('mounts with all props, top right variant', () => {
    cy.mount(
      <RoundedCornerMedia
        src="test.mp4"
        variant={RoundedCornerVariant.TopRight}
        extraClasses="test"
      />
    );
    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.class', 'rounded-tr-3xl');
  });

  it('mounts with all props, top right variant', () => {
    cy.mount(
      <RoundedCornerMedia
        src="test.png"
        variant={RoundedCornerVariant.TopRight}
        extraClasses="test"
      />
    );
    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.class', 'test');
    cy.get('img').should('have.class', 'rounded-tr-3xl');
  });

  it('svg - mounts with all props, top right variant, correct img element', () => {
    cy.mount(
      <RoundedCornerMedia
        src="/test.svg"
        variant={RoundedCornerVariant.TopRight}
        extraClasses="test"
      />
    );
    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.class', 'test');
    cy.get('img').should('have.class', 'rounded-tr-3xl');
  });

  it('gif - mounts with all props, top right variant, correct img element', () => {
    cy.mount(
      <RoundedCornerMedia
        src="test.gif"
        variant={RoundedCornerVariant.TopRight}
        extraClasses="test"
      />
    );
    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.class', 'test');
    cy.get('img').should('have.class', 'rounded-tr-3xl');
  });
});