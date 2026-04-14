import { Button, ButtonSize, ButtonType } from 'components/elements/Button';

import { ComponentMeta, ComponentStory } from '@storybook/react';
import { PlusCircle } from 'phosphor-react';
import React from 'react';

const icons = {
  PlusCircle: <PlusCircle />
};

export default {
  title: 'elements/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  args: {
    size: ButtonSize.LARGE,
    type: ButtonType.PRIMARY,
    label: 'Button'
  },
  argTypes: {
    icon: {
      options: ['', Object.keys(icons)],
      mapping: icons,
      control: {
        type: 'select',
        labels: {
          PlusCircle: 'Plus Circle',
        },
      },
    }
  },
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  type: ButtonType.PRIMARY,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  type: ButtonType.SECONDARY,
  label: 'Button',
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  type: ButtonType.TERTIARY,
  label: 'Button',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  type: ButtonType.PRIMARY,
  label: 'Button',
  icon: <PlusCircle size={32} />
};

export const WebPrimary = Template.bind({});
WebPrimary.args = {
  type: ButtonType.WEB_PRIMARY,
  label: 'Get Profile'
};
export const WebSecondary = Template.bind({});
WebSecondary.args = {
  type: ButtonType.WEB_SECONDARY,
  label: 'Get Profile'
};

export const Small = Template.bind({});
Small.args = {
  label: 'Small',
  size: ButtonSize.SMALL
};

export const Medium = Template.bind({});
Medium.args = {
  label: 'Medium',
  size: ButtonSize.MEDIUM
};

export const Large = Template.bind({});
Large.args = {
  label: 'Large',
  size: ButtonSize.LARGE
};

export const XLarge = Template.bind({});
XLarge.args = {
  label: 'XLarge',
  size: ButtonSize.XLARGE
};

export const IconOnly = Template.bind({});
IconOnly.args = {
  label: '',
  icon: <PlusCircle size={32} />
};

export const Loading = Template.bind({});
Loading.args = {
  loading:'true',
  loadingText: 'Loading...'
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Button',
};
