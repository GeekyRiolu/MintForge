/// <reference types="cypress" />

import useCopyClipboard from '../../../hooks/useCopyClipboard';

const TestComponent = () => {
  const [isCopied, setCopied] = useCopyClipboard();

  return <div>
    <div id="isCopied">{isCopied + ''}</div>
    <button id="copyButton" onClick={() => setCopied('hello')}>Copy</button>
  </div>;
};

describe('useCopyClipboard', () => {
  it('should copy text to clipboard', () => {
    cy.mount(
      <TestComponent />
    );
    cy.get('#isCopied').should('have.text', 'false');
    cy.get('#copyButton').click();
    cy.get('#isCopied').should('have.text', 'true');
  });
});