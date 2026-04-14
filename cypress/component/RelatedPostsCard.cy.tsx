import '../plugins/tailwind';

import RelatedPostCard from '../../components/modules/BlogPage/RelatedPostsCard';
import * as testPost from '../fixtures/blog_post.json';

describe('RelatedPostCard', () => {
  it('mounts with valid post and styling', () => {
    cy.mount(
      <RelatedPostCard post={testPost} />
    );
    cy.get('h3').should('have.text', 'test blog post');

    cy.get('p').should('have.css', 'font-weight').and('match', /400/);

    cy.get('.mt-1').should('have.text', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut lobortis diam m...');
    cy.get('.mt-1').invoke('text').then((text) => {
      expect(text.length).to.be.below(79);
    });

    cy.get('p').contains('John Doe');

    cy.get('p.text-xxs3').should('contain.text', 'Sep 1st, 2003');

    cy.get('img').should('have.attr', 'src');
    cy.get('img').should('have.attr', 'alt');
  });
});