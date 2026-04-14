
import { FooterLarge as StaticFooterLarge } from './FooterLarge';
import { FooterSmall as StaticFooterSmall } from './FooterSmall';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicFooterLarge = dynamic<React.ComponentProps<typeof StaticFooterLarge>>(() => import('components/elements/Footer/FooterLarge').then(mod => mod.FooterLarge), {
  loading: () => <footer className="h-20 bg-black">Loading...</footer>
});
const DynamicFooterSmall = dynamic<React.ComponentProps<typeof StaticFooterSmall>>(() => import('components/elements/Footer/FooterSmall').then(mod => mod.FooterSmall), {
  loading: () => <footer className="h-20 bg-black">Loading...</footer>
});

type FooterProps = {
  isLarge?: boolean;
};

export const Footer = ({ isLarge }: FooterProps) => {
  return (
    isLarge ? <DynamicFooterLarge /> : <DynamicFooterSmall />
  );
};
