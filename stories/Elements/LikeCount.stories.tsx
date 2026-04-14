import LikeCount from 'components/elements/LikeCount';

// eslint-disable-next-line no-restricted-imports
import { MockWagmiDecorator } from '../../.storybook/decorators';

import { Meta, StoryFn } from '@storybook/react';
import { Wallet } from 'ethers';
import React from 'react';
const demoWallet = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

export default {
  title: 'elements/LikeCount',
  component: LikeCount,
  argTypes: {
    onClick: {
      action: 'clicked',
    }
  },
  decorators: [MockWagmiDecorator(demoWallet)]
} as Meta<typeof LikeCount>;

const Template: StoryFn<typeof LikeCount> = (args) => {
  return <LikeCount {...args} mutate={() => null} />;
};

export const Liked = Template.bind({});
Liked.args = {
  count: 1,
  isLiked: true
};

export const NotLiked = Template.bind({});
NotLiked.args = {
  count: 0,
  isLiked: false
};

export const NotLikedWithCount = Template.bind({});
NotLikedWithCount.args = {
  count: 7,
  isLiked: false
};

