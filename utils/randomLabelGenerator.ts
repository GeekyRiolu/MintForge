
export function randomLabelGenerator(): string {
  const random = Math.floor(Math.random() * (420 + 69));
  const standardLabels = [
    'Welcome Back!',
    'What\'s s cookin\' 🧑‍🍳 good lookin\'?',
    'Long time, no see 👀',
    'Great to have you back',
    'Howdy! 🤠',
    '01101000 01101001',
    '👋',
  ];

  const rareLabels = [
    '🤖',
    '🤘',
    '🚀 🚀 🚀',
    'lgtm 🔥',
    'Your Profile = 🔥🔥🔥',
    'Do blockchains dream of electric apes?',
    'You are the best',
    'Do something awesome today, you deserve it',
    'Hey you, yes you! You are awesome!',
  ];

  const ultraRareLabels = [
    '¯\\_(ツ)_/¯',
    'lorem ipsum... blah blah blah',
    'Hello World!',
    'This IS the utility',
    'TYBG 🙏',
    'I know what you right-click-saved last summer',
    'Stuck in the metaverse with you',
    '0x0000000000000000000000000000000000000000'
  ];

  const epicLabels = [
    `➖➖➖🟩🟩➖🟩🟩
  ➖➖🟩🟩🟩🟩🟩🟩🟩
  ➖🟩🟩⬜⬛⬜⬜⬛🟩
  ➖🟩🟩🟩🟩🟩🟩🟩
  🟩🟩🟩🟩🟥🟥🟥🟥
  🟩🟩🟩🟩🟩🟩🟩
  🟦🟦🟦🟦🟦🟦🟦`,
    'Based Ghouls 👀',
    'Hello from San Juan and beyond'
  ];
  if ((random === (420 + 69 / 2))) {
    return epicLabels[Math.floor(Math.random() * epicLabels.length)];
  }
  if (random === 69 || random === 420) {
    return ultraRareLabels[Math.floor(Math.random() * ultraRareLabels.length)];
  }
  if(random === 42 || (random > 369 && random < 420)) {
    return rareLabels[Math.floor(Math.random() * rareLabels.length)];
  }
  return standardLabels[Math.floor(Math.random() * standardLabels.length)];
}