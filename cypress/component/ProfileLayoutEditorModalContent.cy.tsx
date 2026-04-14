import { ProfileLayoutEditorModalContent } from '../../components/modules/Profile/ProfileLayoutEditorModalContent';

describe('ProfileLayoutEditorModalContent', () => {
  it('component mounts with default layout mode selected', () => {
    cy.mount( <ProfileLayoutEditorModalContent savedLayoutType={'Default'} onClose={() => null } />);

    cy.get('[data-testid=Default-layout-option2]').should('have.class', 'border-link');
    cy.get('[data-testid=ConfirmButton]').should('contain.text', 'Confirm');
  });
});