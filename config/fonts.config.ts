import { DM_Mono, Rubik } from '@next/font/google';
import localFont from '@next/font/local';

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
});

const rubik = Rubik({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
});

const grotesk = localFont({
  src: [
    {
      path: '../public/fonts/HKGrotesk-Light.otf',
      weight: '300',
    },
    {
      path: '../public/fonts/HKGrotesk-Regular.otf',
      weight: '400',
    },
    {
      path: '../public/fonts/HKGrotesk-Medium.otf',
      weight: '500',
    },
    {
      path: '../public/fonts/HKGrotesk-SemiBold.otf',
      weight: '600',
    },
    {
      path: '../public/fonts/HKGrotesk-Bold.otf',
      weight: '700',
    },
  ]

});

const noiGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/NoiGroteskTrial/NoiGroteskTrial-Light.woff2',
      weight: '300',
    },
    {
      path: '../public/fonts/NoiGroteskTrial/NoiGroteskTrial-Regular.woff2',
      weight: '400',
    },
    {
      path: '../public/fonts/NoiGroteskTrial/NoiGroteskTrial-RegularItalic.woff2',
      weight: '400',
      style: 'italic'
    },
    {
      path: '../public/fonts/NoiGroteskTrial/NoiGroteskTrial-Medium.woff2',
      weight: '500',
    },
    {
      path: '../public/fonts/NoiGroteskTrial/NoiGroteskTrial-SemiBold.woff2',
      weight: '600',
    },
    {
      path: '../public/fonts/NoiGroteskTrial/NoiGroteskTrial-Bold.woff2',
      weight: '700',
    },
  ]
});

const fonts = { dmMono, grotesk, noiGrotesk, rubik };

export default fonts;
