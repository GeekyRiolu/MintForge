const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    screens: {
      // everything above 1200 is XL, but content should be constrained to 1200px
      'minmd' : '600px',
      'minlg' : '900px',
      'minxl' : '1200px',
      'minxxl': '1600px',
      'minhd' : '1921px',
      // "small" is handled as the default

      // if all other sizes below are specified, then the "default" value wil apply to the XL range too.
      'xl': { 'max': '10000px' },
      'lg': { 'max': '1199px' },
      'md': { 'max' : '899px' },
      'sm': { 'max': '599px' },
      'xs': { 'max' : '374px' },

      // maxes
      'deprecated_2xl': { 'max': '1800px' },
      'deprecated_md': { 'max': '960px' },
      'deprecated_sm': { 'max': '640px' },
    },
    extend: {
      colors: {
        'primary-txt':'#111111',
        'primary-txt-dk':'#FFFFFF',
        'secondary-txt':'#777E93',
        'secondary-txt-light': '#F8F8F8',
        'secondary-txt-dk':'#CCCCCC',
        'primary-pink':'#F2358E',
        'secondary-pink':'#E369A4',
        'primary-green':'#15C666',
        'accent':'#F0F5FF',
        'accent-dk':'#2C3448',
        'accent-border':'#7D8795',
        'accent-border-dk':'#384260',
        'primary-button-txt':'#FFFFFF',
        'primary-button-bckg':'#111111',
        'deprecated_primary-button-bckg':'#00A4FF',
        'primary-button-border': '#7D8795',
        'always-white':'#FFFFFF',
        'always-black':'#000000',
        'primary-1':'#0164d0',
        'blue-name':'#0093E4',
        'green-summary':'#4FC853',
        'headerbg':'#FFFFFF',
        'headerbg-dk':'#0C0F17',
        'pagebg':'#FFFFFF',
        'pagebg-dk':'#0C0F17',
        'header-txt':'#6B7082',
        'header-pink':'#FF0078',
        'modal-bg':'#FFFFFF',
        'modal-bg-dk':'#22293B',
        'modal-overlay': '#f0f5ff', // use with opacity 50, i.e. modal-overlay/50
        'modal-overlay-dk': '#171b27', // use with opacity 50, i.e. modal-overlay-dk/50
        'feature-overlay': '#B0AFAF',
        'row-border':'#E6ECFF',
        'green1':'#27AE60',
        'gkWalletOptionBgHover':'#2C3448',
        'button-hv-1':'#a8abb3',
        'red-1':'#FF6871',
        'text-4':'#C3C5CB',
        'footer-txt':'#787E91',
        'primary-btn-txt-disabled':'#777E91',
        'transparent-border':'#7A8092',
        'toggle-bg':'#00A4FF',
        'grey-txt':'#d4d4d4',
        'row-bg-active':'#2c334a',
        'select-brdr':'#CAD2EA',
        'hero-pink':'#FF62EF',
        'hero-blue': '#03C1FD',
        'hero-gray':'#909090',
        'action-primary': '#00A4FF',
        'pill-border': '#7D8795',
        'link': '#00A4FF',
        'gray-opacity':'#c4c4c49e',
        'vault-pink':'#C264B9',
        'dark-overlay': '#303030E5',
        'dark-type-primary': '#F3F3F3',
        'tileBackgroundSecondary': '#303030',
        'secondary-bg-dk': '#303030',
        'looksrare-green': '#0CE466',
        'opensea-blue': '#2081E2',
        'share-icon': '#E4E4E4',
        'share-icon-bg': '#FBF9F9',
        'blog-text': '#727272',
        'blog-text-reskin': '#6F6F6F',
        'secondary-dk': '#222222',
        'blog-slider-blue': '#DCF2FF',
        'footer-bg': '#F8F8F8',
        'footer-bg-dk': '#0C0F17',
        'primary-yellow': '#F9D963',
        'link-yellow': '#B59007',
        'secondary-yellow': '#FCBB1B',
        'key-bg': '#4D4D4D',
        'key-gray': '#8B8B8B',
        'alert-red': '#E43D20',
        'alert-red-light': '#E45E47',
        'alert-red-bg': '#FCE3E3',
        'alert-red-bg-light': '#FFF8F7',
        'alert-green': '#26AA73',
        'alert-green-light': '#3EC98E',
        'alert-green-bg': '#C1F4DE',
        'alert-green-bg-light': '#F0FFF9',
        'alert-yellow': '#E4B200',
        'alert-yellow-light': '#FFC737',
        'alert-yellow-bg': '#FFF0CB',
        'alert-yellow-bg-light': '#FFF9ED',
        'alert-grey': '#6A6A6A',
        'alert-grey-bg': '#F2F2F2',
        'button-bg-disabled': '#E6E6E6',
        'button-text-disabled': '#969696',
        'button-tertiary-hover': '#4D4D4D',
        'button-secondary-hover': '#282828',

      },
      fontFamily: {
        'dm-mono': ['var(--dm-mono-font)', ...fontFamily.sans],
        'grotesk': ['var(--grotesk-font)', ...fontFamily.sans],
        'noi-grotesk': ['var(--noi-grotesk-font)', 'var(--rubik-font)','sans-serif', ...fontFamily.sans],
      },
      fontSize: {
        'copy-size': '0.825rem',
        '2xll': '1.6rem',
        'xxs1': '0.4rem',
        'xxs2': '0.6rem',
        'xxs4': '0.5rem',
        '3xll': '1.75rem',
        'xxs3': '0.688rem',
        'header': '4.75rem',
        'section': '2.25rem',
        'body': '1rem',
        'xll': '1.375rem'
      },
      fontWeight: {
        'header': '700',
        'body': '400',
      },
      lineHeight: {
        'header': '4.5rem',
        'body': '1.5rem',
        5.5: '1.4',
      },
      keyFrames: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(0, 164, 255, 1)' },
          '50%': { borderColor: 'rgba(0, 164, 255, 0)' },
        },
        textGradient: {
          '0%': { backgroundPosition: 'left' },
          '50%': { backgroundPosition: 'right' },
          '100%': { backgroundPosition: 'left' }
        }
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-border': 'pulseBorder 2s linear infinite',
        'text-gradient': 'textGradient 2s ease-in-out infinite',
      },
      padding: {
        '30px': '30px',
        '20px': '20px',
      },
      margin: {
        'n3':'-3px',
      },
      width: {
        'pic1': '15.125rem',
        'slider-button': '1.5625rem',
        '61':'14.5rem',
        'slider-card': '93.5%',
      },
      height: {
        'slider-button': '2.1875rem',
        'sumBanner': '2.875rem',
        'homeTicker': '155px',
        'blogHero-lg': '29rem',
        'blogHero-xl': '37rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-radial-gradient':
          'radial-gradient(59.6% 80.37% at 50.68% 83.52%, #272F46 0%, #202F56 46.87%, #030406 100%)',
        'hero-gradient':
          'linear-gradient(180deg, rgba(0, 0, 0, 0) 63.02%, #000000 100%)',
        'img-shadow':
          'linear-gradient(0deg, #000000 32.93%, rgba(0, 0, 0, 0) 100%)',
        'text-gradient': 'linear-gradient(#FAC213, #FAC213)',
        'img-shadow-light':
          //'linear-gradient(0deg, #F9D54C 32.93%, rgba(249, 213, 76, 0) 100%)',
          'linear-gradient(180deg, rgba(252, 194, 21, 0) 0%, #F9D54C 100%)',
        'img-shadow-dark':
          'linear-gradient(0deg, #000000 32.93%, rgba(0, 0, 0, 0) 100%)',
      },
      aspectRatio: {
        '4/3': '4/3',
      },
      gridTemplateColumns: {
        '1.3': '1.3fr 1fr'
      },
      maxWidth: {
        'nftcom': '1200px',
      }
    },
  },
  variants: {
    fill: ['hover', 'focus'],
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
  ],
};
