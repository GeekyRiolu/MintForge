import {
  useState,
} from 'react';

const retrieveKey = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

interface Input<K extends string | number | symbol> {
  // An object that maps the name of a sibling to its associated numeric z-index:
  normalZIndices?: Record<K, number>
  // The value of the z-index that a sibling gets when it's "promoted". Should
  // be greater than all values in `normalZIndices`:
  promotedZIndex: number
}

const usePromotableZIndex = <K extends string | number | symbol>(input: Input<K>) => {
  const { promotedZIndex } = input;
  const normalZIndices = {
    modal: 300,
    wallet: 200,
    sidebar: 199,
  };
  type SiblingName = keyof typeof normalZIndices

  // The name of the currently promoted sibling, if any. Initialized to
  // `undefined` (none promoted):
  const [promotedElementName, setPromotedElementName] = useState<SiblingName | undefined>(undefined);

  // Returns the z-index of a sibling, taking into currentAddress whether it's the
  // currently promoted one:
  const getZIndex = (siblingName: SiblingName) =>
    (promotedElementName === siblingName) ? promotedZIndex : retrieveKey(normalZIndices, siblingName);

  const promoteZIndex = (siblingName: SiblingName) => setPromotedElementName(siblingName);

  const restoreZIndex = () => setPromotedElementName(undefined);

  return {
    // The hook returns 3 functions:

    // This is called with a sibling's name and returns what z-index that
    // sibling should have:
    getZIndex,
    // This is called with the name of the sibling that wants to promote itself to a higher
    // z-index than the rest:
    promoteZIndex,
    // This is called when any sibling wants to restore all siblings' z-index'es
    // to normal values:
    restoreZIndex,
  };
};

export default usePromotableZIndex;
