import { Colors } from 'styles/theme/styled';

export * from 'styles/theme/Components';

const white = '#FFFFFF';
const black = '#000000';

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? 'white' : '#001429',
    text2: '#565A69',
    text3: '#888D9B',
    text4: '#C3C5CB',
    text5: '#EDEEF2',

    // backgrounds / greys
    bg1: darkMode ? '#001429' : '#FFFFFF',
    bg2: darkMode ? '#001429' : '#FFF',
    bg3: darkMode ? '#001429' : '#E5EFFA',
    bg4: '#0164d0',
    bg5: '#888D9B',
    bg6: darkMode ? '#DF3951' : '#FFF',
    bg7: darkMode ? '#DF3951' : '#FFF',
    bg8: darkMode ? '#DF3951' : '#FFF',

    //specialty colors
    modalBG: 'rgba(0,0,0,0.6)',
    advancedBG: '#FFFFFF',
    gkWalletOptionBgHover: '#2C3448',

    //primary colors
    primary1: '#0164d0',
    primary2: '#0164d0',
    primary3: '#FF99C9',
    primary4: darkMode ? '#192B3E' : '#F6DDE8',
    primary5: darkMode ? '#192B3E' : '#FDEAF1',
    primary6: '#DF3951',

    // color text
    primaryText1: darkMode ? 'white' : '#000',

    // secondary colors
    secondary1: '#0164d0',
    secondary2: '#F6DDE8',
    secondary3: '#FDEAF1',

    // other
    red1: '#FF6871',
    red2: '#F82D3A',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
  };
}
