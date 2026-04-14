import Tooltip, { ToolTipProps } from 'components/elements/CustomTooltip';

import { Meta } from '@storybook/react';
import React, { PropsWithChildren } from 'react';

export default {
  title: 'Elements/Tooltip',
  component: Tooltip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  args: {
    orientation: 'top',
    tooltipComponent: <div>Tooltip Content</div>,
  },
} as Meta;

const Template = (args: PropsWithChildren<ToolTipProps>) => (
  <div className='max-auto w-44 my-10 flex justify-center items-center'>
    <Tooltip {...args}>
      <button>Hover me</button>
    </Tooltip>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  orientation: 'top',
  tooltipComponent: <div>Tooltip Content</div>,
};

export const LeftOrientation = Template.bind({});
LeftOrientation.args = {
  orientation: 'left',
  tooltipComponent: <div>Tooltip Content</div>,
};

export const RightOrientation = Template.bind({});
RightOrientation.args = {
  orientation: 'right',
  tooltipComponent: <div>Tooltip Content</div>,
};

export const BottomOrientation = Template.bind({});
BottomOrientation.args = {
  orientation: 'bottom',
  tooltipComponent: <div>Tooltip Content</div>,
};

export const LongSentence = Template.bind({});
LongSentence.args = {
  orientation: 'top',
  tooltipComponent: <div className='word-wrap w-36 text-center'><p>Longer text divided
  into two lines</p></div>,
};

export const CustomPosition = Template.bind({});
CustomPosition.args = {
  orientation: 'custom',
  tooltipComponent: <div>Tooltip Content</div>,
  customLeftPosition: '20',
};

export const CustomFullLeftPosition = Template.bind({});
CustomFullLeftPosition.args = {
  orientation: 'custom',
  tooltipComponent: <div>Tooltip Content</div>,
  customFullLeftPosition: 'left-5',
};

export const WithClick = Template.bind({});
WithClick.args = {
  orientation: 'top',
  tooltipComponent: <div>Tooltip Content</div>,
  tooltipClick: () => alert('Tooltip Clicked!'),
};

export const Hidden = Template.bind({});
Hidden.args = {
  orientation: 'top',
  tooltipComponent: <div>Tooltip Content</div>,
  hidden: true,
};

export const useFullWidth = (args) => (
  <div className='w-1/2 mt-20'>
    <Tooltip
      useFullWidth
      orientation='top'
      tooltipComponent={
        <div
          className="w-max"
        >
          <p>Update your bio</p>
        </div>}
      {...args}>
      <textarea
        className="border-2 border-[#ECECEC] h-32 hover:outline-3 resize-none rounded-xl text-[#6A6A6A] text-left w-full"
        maxLength={300}
        placeholder="Enter bio (optional)" />
    </Tooltip>
  </div>
);
