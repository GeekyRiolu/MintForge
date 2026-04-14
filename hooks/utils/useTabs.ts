import { Dispatch, SetStateAction, useState } from 'react';

type Tabs = Record<number, string>;

type TabKey = keyof Tabs;

/**
 * A custom hook that manages the state of the currently selected tab and returns the
 * selected tab, a function to set the selected tab, and an array of tab names.
 * @param {TabKey} [initialTab=0] - The initial tab to be selected.
 * @param {Tabs} tabs - An object containing the names of all available tabs.
 * @returns An array containing the selected tab, a function to set the selected tab, and an array of tab names.
 */
export const useTabs = (initialTab: TabKey = 0, tabs: Tabs): [number, Dispatch<SetStateAction<number>>, string[]] => {
  const [selectedTab, setSelectedTab] = useState<TabKey>(initialTab);
  const tabNames = Object.values(tabs);
  return [selectedTab, setSelectedTab, tabNames];
};
