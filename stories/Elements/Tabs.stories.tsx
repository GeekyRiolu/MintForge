import { Tabs } from 'components/elements/Tabs';
import { tw } from 'utils/tw';

import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

export default {
  title: 'elements/Tabs',
  component: Tabs,
  args: {
    tabOptions: [
      {
        label: 'Tab 1',
        content: <p>This is the content of Tab 1</p>,
      },
      {
        label: 'Tab 2',
        content: <p>This is the content of Tab 2</p>,
      }
    ]
  },

} as Meta<typeof Tabs>;

const Template: StoryFn<typeof Tabs> = (args) => <Tabs {...args} />;

export const Base = Template.bind({});

export const WithLabelChild = Template.bind({});
WithLabelChild.args = {
  tabOptions: [
    {
      label: 'Tab 1',
      content: <p>This is the content of Tab 1</p>,
      labelChild: <span
        className={tw(
          'rounded-full h-5 w-5 flex items-center justify-center text-sm ml-2 justify-self-center',
          'text-teal-400'
        )}>
          test
      </span>
    },
    {
      label: 'Tab 2',
      content: <p>This is the content of Tab 2</p>,
      labelChild: <span
        className={tw(
          'rounded-full h-5 w-5 flex items-center justify-center text-sm ml-2 justify-self-center',
          'bg-red-400 text-white'
        )}>
          22
      </span>
    }
  ]
  
};

export const FullWidth = Template.bind({});

export const WidthMax = Template.bind({});
WidthMax.args = {
  customTabWidth: 'w-max'
};

export const CustomWidth = Template.bind({});
CustomWidth.args = {
  customTabWidth: 'minlg:max-w-md minlg:w-[448px]'
};