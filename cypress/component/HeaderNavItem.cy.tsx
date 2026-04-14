import '../plugins/tailwind';

import { HeaderNavItem } from '../../components/elements/HeaderNavItem';

describe('HeaderNavItem', () => {
  it('renders inactive ReactNode logo', () => {
    cy.viewport(800, 1200);
    cy.mount(
      <HeaderNavItem
        active={false}
        alt={'test-alt'}
        logoActive={<div>testLogoActive</div>}
        logoInactive={<div>testLogoInactive</div>}
        styleClasses={[]}
      />
    );
    cy.findByText('testLogoInactive').should('exist');
  });

  it('renders inactive ReactNode logo', () => {
    cy.viewport(800, 1200);
    cy.mount(
      <HeaderNavItem
        active={true}
        alt={'test-alt'}
        logoActive={<div>testLogoActive</div>}
        logoInactive={<div>testLogoInactive</div>}
        styleClasses={[]}
      />
    );
    cy.findByText('testLogoActive').should('exist');
  });
});