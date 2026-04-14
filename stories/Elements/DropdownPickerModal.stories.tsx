import { DropdownPickerModal, DropdownPickerModalProps } from 'components/elements/DropdownPickerModal';

import { Meta } from '@storybook/react';
import { Layout, Link, TwitterLogo } from 'phosphor-react';
import LayoutIcon1 from 'public/icons/layout-icon-1.svg?svgr';
import LayoutIcon3 from 'public/icons/layout-icon-3.svg?svgr';
import React, { PropsWithChildren } from 'react';

export default {
  title: 'Elements/DropdownPickerModal',
  component: DropdownPickerModal,
  argTypes: {
    options: { control: { disable: true } },
    selectedIndex: { control: { disable: true } },
  }
} as Meta;

const Template = (args: PropsWithChildren<DropdownPickerModalProps>) => (
  <div className='w-72 flex justify-center mx-auto items-center rounded-xl'>
    <DropdownPickerModal {...args}>
      <div className='w-full h-10 bg-white flex justify-center items-center border hover:cursor-pointer rounded-xl'>
          Dropdown Modal
      </div>
    </DropdownPickerModal>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  align: 'center',
  pointer: true,
  options: [
    {
      label: 'Settings',
      onSelect: () => console.log('Settings'),
      closeModalOnClick: true,
    },
    {
      label: 'Edit profile',
      onSelect: () => console.log('Edit profile'),
      closeModalOnClick: false,
    },
    {
      label: 'Show descriptions',
      onSelect: () => console.log('Show descriptions'),
      closeModalOnClick: true,
    },
    {
      label: 'Show GK Badge',
      onSelect: () => console.log('Show descriptions'),
      closeModalOnClick: true,
    },
  ],
  selectedIndex: 0,
};

export const IconsOnly = Template.bind({});
IconsOnly.args = {
  align: 'center',
  pointer: true,
  options: [
    {
      onSelect: () => console.log('Layout 1'),
      icon: <LayoutIcon1 />,
      closeModalOnClick: true,
    },
    {
      icon: <Layout size={20} color={'black'} />,
      onSelect: () => console.log('Layout 2'),
      closeModalOnClick: false,
    },
    {
      icon: <LayoutIcon3 />,
      onSelect: () => console.log('Layout 3'),
      closeModalOnClick: true,
    },
  ],
  selectedIndex: 0,
};

export const LabelsAnsIcons = Template.bind({});
LabelsAnsIcons.args = {
  align: 'center',
  pointer: true,
  options: [
    {
      label: 'Copy link to clipboard',
      onSelect: () => console.log('Copy link to clipboard'),
      icon: <Link />,
      closeModalOnClick: true,
    },
    {
      label: 'Share via Twitter',
      icon: <TwitterLogo size={20} color={'#1DA1F2'} fill='#1DA1F2' weight="fill"/>,
      onSelect: () => console.log('Share via Twitter'),
      closeModalOnClick: false,
    },
  ],
  selectedIndex: 0,
};

export const Constrained = Template.bind({});
Constrained.args = {
  ...Default.args,
  constrain: true,
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  ...Default.args,
  placeholder: 'Select an option',
};

export const WithPointer = Template.bind({});
WithPointer.args = {
  ...Default.args,
  pointer: true,
};

export const WithRightAlignment = Template.bind({});
WithRightAlignment.args = {
  ...Default.args,
  align: 'right',
};

export const WithLeftAlignment = Template.bind({});
WithLeftAlignment.args = {
  ...Default.args,
  align: 'left',
};

export const WithCenterAlignment = Template.bind({});
WithCenterAlignment.args = {
  ...Default.args,
  align: 'center',
};

export const WithoutMinWidth = Template.bind({});
WithoutMinWidth.args = {
  ...Default.args,
  disableMinWidth: true,
};

export const WithoutPadding = Template.bind({});
WithoutPadding.args = {
  ...Default.args,
  disablePadding: true,
};

export const WithBlackBorder = Template.bind({});
WithBlackBorder.args = {
  ...Default.args,
  blackBorder: true,
};

export const StopMobileModal = Template.bind({});
StopMobileModal.args = {
  ...Default.args,
  stopMobileModal: true,
};

export const CloseModalOnClick = Template.bind({});
CloseModalOnClick.args = {
  ...Default.args,
  closeModalOnClick: true,
};
