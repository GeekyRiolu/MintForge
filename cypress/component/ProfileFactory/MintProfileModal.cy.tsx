import '../../plugins/tailwind';

import MintProfileModal from '../../../components/modules/ProfileFactory/MintProfileModal';
import { setupWagmiClient } from '../../util/utils';

import { BigNumber } from 'ethers';
import { WagmiConfig } from 'wagmi';

describe('MintProfileModal', () => {
  const client = setupWagmiClient();

  it('mounts and renders - type = Free', () => {
    const onChange = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <MintProfileModal
          type='Free'
          isOpen={true}
          setIsOpen={onChange}
          profilesToMint={[
            {
              profileURI: 'lucasTest',
              hash: 'shadlhsakldas',
              signature: '126as9f6ashj',
              status: 'Available',
              name: 'input1'
            }
          ]}
        />
      </WagmiConfig>
    );
    cy.findByText('Mint a Profile').should('exist');
    cy.findByText('Confirm your order details before minting.').should('exist');
    cy.findByText('Free').should('exist');
    cy.findByText('nft.com/lucasTest').should('exist');
  });

  it('mounts and renders - type = GK', () => {
    const onChange = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <MintProfileModal
          type='GK'
          isOpen={true}
          setIsOpen={onChange}
          profilesToMint={[
            {
              profileURI: 'lucasTestGK',
              hash: 'shadlhsakldas',
              signature: '126as9f6ashj',
              status: 'Available',
              name: 'input0'
            },
            {
              profileURI: 'lucasTestGK2',
              hash: 'shadlhsakldass',
              signature: '126as9f6ashfj',
              status: 'Available',
              name: 'input1'
            }
          ]}
        />
      </WagmiConfig>
    );
    cy.findByText('nft.com/lucasTestGK').should('exist');
    cy.findByText('nft.com/lucasTestGK2').should('exist');
  });

  it('mounts and renders - type = Paid', () => {
    const onChange = cy.stub();
    cy.mount(
      <WagmiConfig client={client}>
        <MintProfileModal
          type='Paid'
          isOpen={true}
          setIsOpen={onChange}
          transactionCost={BigNumber.from('1000000000000000')}
          profilesToMint={[
            {
              profileURI: 'lucasTestPaid',
              hash: 'shadlhsakldas',
              signature: '126as9f6ashj',
              status: 'Available',
              name: 'input0'
            }
          ]}
        />
      </WagmiConfig>
    );
    cy.findByText('nft.com/lucasTestPaid').should('exist');
    cy.findByText('0.001').should('exist');
  });
});
