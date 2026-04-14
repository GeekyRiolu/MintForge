import '../plugins/tailwind';

import { DropdownPicker } from '../../components/elements/DropdownPicker';

describe('DropdownPicker', () => {
  it('mounts with valid props', () => {
    cy.mount(
      <DropdownPicker
        options={[
          {
            label: 'first',
            onSelect: () => null,
          },
          {
            label: 'first',
            onSelect: () => null,
          }
        ]}
        selectedIndex={0}
      />
    );
    cy.root().click();
  });

  it('mounts with constrin', () => {
    cy.mount(
      <DropdownPicker
        constrain
        above
        options={[
          {
            label: 'first',
            onSelect: () => null,
          },
          {
            label: 'first',
            onSelect: () => null,
          }
        ]}
        selectedIndex={0}
      />
    );
    cy.root().click();
  });
});