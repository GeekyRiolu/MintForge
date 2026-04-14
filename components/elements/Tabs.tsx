import { useTabs } from 'hooks/utils';
import { tw } from 'utils/tw';

import { Tab } from '@headlessui/react';
import { ReactNode, useCallback } from 'react';

type Tab = {
  label: string;
  content?: ReactNode;
  labelChild?: ReactNode;
};

type TabsProps = {
  tabOptions: Tab[];
  defaultTab?: number;
  onTabChange?: (selectedTab: string) => void;
  //set tab width classes
  customTabWidth?: string
};

export function Tabs({ tabOptions, defaultTab, onTabChange, customTabWidth }: TabsProps) {
  const [selectedTab, setSelectedTab] = useTabs(defaultTab ?? 0, tabOptions.reduce((obj, string, index) => (obj[index] = string, obj), {}));

  const handleTabChange = useCallback((index: number) => {
    setSelectedTab(index);
    if (onTabChange) {
      onTabChange(tabOptions[index]?.label);
    }
  }, [onTabChange, setSelectedTab, tabOptions]);

  return (
    <Tab.Group>
      <Tab.List className={tw(
        'flex space-x-2 bg-[#F6F6F6] rounded-3xl',
        customTabWidth ?? 'w-full'
      )}>
        {tabOptions.map((tab, index) => (
          <Tab
            key={`tab-${index}`}
            className={tw(
              'w-full',
              'rounded-3xl py-2.5 md:px-5 px-8 font-noi-grotesk text-[16px] font-medium leading-5 text-[#6F6F6F] flex justify-center',
              selectedTab === index && 'bg-black text-[#F8F8F8]'
            )
            }
            onClick={() => handleTabChange(index)}
          >
            {tab.label}
            {tab?.labelChild}
          </Tab>
        ))}
      </Tab.List>
      {tabOptions.map((tab, index) => (
        <Tab.Panel key={index} className="py-4">
          {selectedTab === index && tab.content}
        </Tab.Panel>
      ))}
    </Tab.Group>
  );
}