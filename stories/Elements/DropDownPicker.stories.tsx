import { DropdownPicker, PickerOption } from 'components/elements/DropdownPicker';

// eslint-disable-next-line no-restricted-imports
import { MockWagmiDecorator } from '../../.storybook/decorators';

import { Meta } from '@storybook/react';
import { Wallet } from 'ethers';
import React from 'react';
const demoWallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

export default {
  title: 'Elements/DropdownPicker',
  component: DropdownPicker,
  argTypes: {
    selectedIndex: { control: 'number' },
    constrain: { control: 'boolean' },
    above: { control: 'boolean' },
    placeholder: { control: 'text' },
    showKeyIcon: { control: 'boolean' },
    v2: { control: 'boolean' },
  },
  decorators: [MockWagmiDecorator(demoWallet)]
} as Meta;

const options: Array<PickerOption> = [
  {
    label: 'Report',
    onSelect: () => console.log('Report'),
  },
  {
    label: 'Contact',
    onSelect: () => console.log('Contact'),
  },
  {
    label: 'Deploy',
    onSelect: () => console.log('Deploy'),
  },
];

export const Basic = (args) => <div className='w-48 mt-48 flex justify-center mx-auto items-center rounded-xl'><DropdownPicker options={options} {...args} placeholder="Select an option" /></div>;

export const WithIcons = (args) => (
  <div className='w-48 flex justify-center mx-auto items-center rounded-xl'>
    <DropdownPicker
      placeholder="Select an option"
      options={[
        {
          label: 'Report',
          onSelect: () => console.log('Report'),
          icon: '/shop-icon.svg',
        },
        {
          label: 'Contact',
          onSelect: () => console.log('Contact'),
          icon: '/layout-icon-1.svg',
        },
        {
          label: 'Deploy',
          onSelect: () => console.log('Deploy'),
          icon: '/mint-key.svg',
        },
      ]}
      {...args}
    />
  </div>
);

export const TextCentered = (args) => (
  <div className='w-48 flex justify-center mx-auto items-center rounded-xl'>
    <DropdownPicker
      placeholder="Select an option"
      centeredText={true}
      options={[
        {
          label: 'Price high to low',
          onSelect: () => console.log('Report'),
        },
        {
          label: 'Price low to high',
          onSelect: () => console.log('Contact'),
        },
        {
          label: 'Recently listed',
          onSelect: () => console.log('Deploy'),
        },
        {
          label: 'Recently created',
          onSelect: () => console.log('Deploy'),
        },
      ]}
      {...args}
    />
  </div>
);

export const WithSelectedIndex = (args) => (
  <div className='w-48 flex justify-center mx-auto items-center rounded-xl'>
    <DropdownPicker options={options} selectedIndex={1} {...args} placeholder="Select an option"/>
  </div>
);

export const WithNoPlaceholder = (args) => (
  <div className='w-48 flex justify-center mx-auto items-center rounded-xl'>
    <DropdownPicker options={options} {...args} />
  </div>
);

