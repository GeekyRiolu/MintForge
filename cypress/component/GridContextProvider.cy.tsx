/// <reference types="cypress" />

import { GridContext, GridContextProvider, GridContextType } from '../../components/modules/Draggable/GridContext';

import { useContext } from 'react';

export const buildItem = (id: string) => ({ id });

const TestComponent = () => {
  const {
    items,
    moveItem,
  }: GridContextType = useContext(GridContext);
  
  return <div>
    <div id="items">{JSON.stringify(items)}</div>
    <button onClick={() => {
      moveItem('b', 'a');
    }}>moveItem</button>
  </div>;
};

describe('GridContextProvider', () => {
  beforeEach(() => {
    cy.mount(
      <GridContextProvider items={[buildItem('a'), buildItem('b'), buildItem('c')]}>
        <TestComponent />
      </GridContextProvider>
    );
  });

  it('returns the expected default values', () => {
    cy.get('#items').should('have.text', '[{"id":"a"},{"id":"b"},{"id":"c"}]');
  });
});