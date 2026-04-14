import '../../plugins/tailwind';

import Markdown from '../../../components/modules/BlogPage/Markdown';

describe('Markdown', () => {
  it('mounts with valid markdown', () => {
    cy.mount(
      <Markdown content={
        '# Adoption Beyond Speculation1\n' +
        '## Adoption Beyond Speculation2\n' +
        '### Adoption Beyond Speculation3\n' +
        'NFTs, or non-fungible tokens, have risen to prominence as digital tokens representing unique collectibles. NFTs are defined by their uniqueness relative to other tokens whether of the same collection or a different collection.\n'
      }
      />
    );

    cy.get('h1').should('have.text', 'Adoption Beyond Speculation1');
    cy.get('h2').should('have.text', 'Adoption Beyond Speculation2');
    cy.get('h3').should('have.text', 'Adoption Beyond Speculation3');

    cy.get('p').should('have.text', 'NFTs, or non-fungible tokens, have risen to prominence as digital tokens representing unique collectibles. NFTs are defined by their uniqueness relative to other tokens whether of the same collection or a different collection.');
  });

  it('mounts with all elements', () => {
    cy.mount(
      <Markdown content={
        '# this is an H1\n\n## this is an H2\n\n### this is an h3\n\n- Unordered List\n- Unordered List\n\n1. Ordered List\n2. Ordered List\n\nParagraph text\n\n[This is a link](https://google.com "THIS IS A LINK")\n\n---\n\n![City](//images.ctfassets.net/v06qbfn5fzrz/4NzwDSDlGECGIiokKomsyI/65b330d220017e6ee6aa08a6d88e82d2/denys-nevozhai-100695.jpg)'
      }
      />
    );

    cy.get('h1').should('have.text', 'this is an H1');
    cy.get('h2').should('have.text', 'this is an H2');
    cy.get('h3').should('have.text', 'this is an h3');
    cy.get('ol').should('exist');
    cy.get('ul').should('exist');
    cy.get('li').should('exist');
    cy.get('a').should('exist');
    cy.get('img').should('exist');
    cy.get('hr').should('exist');
  });
});