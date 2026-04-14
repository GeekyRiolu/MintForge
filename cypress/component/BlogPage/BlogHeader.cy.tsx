import '../../plugins/tailwind';

import BlogHeader from '../../../components/modules/BlogPage/BlogHeader';

describe('Blog Header', () => {
  it('mounts with valid props', () => {
    cy.mount(
      
      <BlogHeader
        post={{
          title: 'test blog',
          slug: 'test-blog-cypress',
          description: 'yes this is a test blog',
          body: 'test',
          author: {
            image: {
              url: 'https://nft-llc.mypinata.cloud/ipfs/QmSNmVFTJv6cG9M8ZRU8T9F4Kz9HHxmV85ssGP5W8ZsTPa/4490.png'
            },
            name: 'king of testing'
          },
          publishDate: '08/09/2020',
          sys: {
            id: 'testststest'
          }
        }}
      />
    );

    cy.get('h2').should('have.text', 'test blog');
    cy.get('img').should('have.attr', 'alt');
    cy.get('[data-cy="author"]').should('have.text', 'king of testing');
    cy.get('[data-cy="date"]').should('have.text', 'Aug 9th, 2020');
    cy.get('[data-cy="time"]').should('have.text', '0 min read');
  });
});