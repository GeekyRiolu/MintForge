import '../../plugins/tailwind';

import { VerticalProgressBar } from '../../../components/modules/Checkout/VerticalProgressBar';

describe('VerticalProgressBar', () => {
  it('mounts and renders', () => {
    cy.mount(
      <VerticalProgressBar
        nodes={[
          {
            label: 'first'
          },
          {
            label: 'second',
            items: [{ label: 'subItem' }]
          }
        ]}
        activeNodeIndex={0}
      />
    );
  });
});