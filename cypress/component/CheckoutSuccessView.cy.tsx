import { CheckoutSuccessView } from '../../components/modules/Checkout/CheckoutSuccessView';

describe('CheckoutSuccessView', () => {
  it('should render the correct image and text', () => {
    cy.mount(
      <CheckoutSuccessView
        userAddress={'testAddress'}
      />
    );
    cy.get('svg').should('have.class', 'text-green-500');
  });
});