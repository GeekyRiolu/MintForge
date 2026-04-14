import '../../plugins/tailwind';

import ImageWithZoom from '../../../components/modules/BlogPage/ImageWithZoom';

describe('Markdown: Image with zoom', () => {
  it('mounts with valid props', () => {
    cy.mount(
      <ImageWithZoom
        src='//nft-llc.mypinata.cloud/ipfs/QmSNmVFTJv6cG9M8ZRU8T9F4Kz9HHxmV85ssGP5W8ZsTPa/4490.png'
        alt='test alt'
      />
    );
    cy.get('img').should('exist');
    cy.get('img').should('have.attr', 'alt', 'test alt');
    cy.get('img').should('have.class', 'hover:cursor-pointer');
  });
});