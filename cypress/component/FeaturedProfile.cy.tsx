import { FeaturedProfile } from '../../components/elements/FeaturedProfile';

describe('FeaturedProfile', () => {
  it('mounts with all valid props', () => {
    cy.mount(
      <FeaturedProfile
        profileOwner={{
          profile: {
            url: '/test',
            id: 'test'
          }
        }}
        gkId={1}
        featuredNfts={[{
          id: '2185',
          contract: '0x8fB5a7894AB461a59ACdfab8918335768e411414',
          metadata: {
            imageURL: 'ipfs://ipfs/QmUFVMGbwcLfqpghrJSnuLFXU8kdwfGtY84pjSwhRHQdsZ'
          },
          tokenId: 1
        },
        {
          id: '2185',
          contract: '0x8fB5a7894AB461a59ACdfab8918335768e411414',
          metadata: {
            imageURL: 'ipfs://ipfs/QmUFVMGbwcLfqpghrJSnuLFXU8kdwfGtY84pjSwhRHQdsZ'
          },
          tokenId: 2
        },
        {
          id: '2185',
          contract: '0x8fB5a7894AB461a59ACdfab8918335768e411414',
          metadata: {
            imageURL: 'ipfs://ipfs/QmUFVMGbwcLfqpghrJSnuLFXU8kdwfGtY84pjSwhRHQdsZ'
          },
          tokenId: 3
        }]}
      />
    );
    cy.get('.mb-4').should('exist');
    cy.contains('Featured Profile').should('exist');
    cy.contains('test').should('exist');
  });
});