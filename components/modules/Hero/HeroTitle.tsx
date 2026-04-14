import { filterNulls } from 'utils/format';
import { tw } from 'utils/tw';

import ReactRotatingText from 'react-rotating-text';

export interface HeroTitleProps {
  items: string[]
  color?: 'blue' | 'pink' | 'black' | 'white'
}

export function HeroTitle(props: HeroTitleProps) {
  return (
    <div
      className={tw(
        props.color === 'black' && 'text-primary-txt',
        props.color === 'blue' && 'text-[#00A4FF]',
        props.color === 'pink' && 'text-hero-pink',
        props.color === 'white' && 'text-white',
        'text-2xl minmd:text-5xl minxl:text-6xl',
        'z-30 text-center font-normal font-noi-grotesk',
        'max-w-[30rem] minmd:max-w-[43rem] minxl:max-w-[100rem]',
      )}
      style={{
        textShadow: '0px 4px 4px rgba(0,0,0,0.9)',
      }}
    >
      {
        props.items.length === 1 ?
          <>
            {props.items[0]}
          </> :
          <>
            &nbsp;
            <ReactRotatingText
              cursor={false}
              typingInterval={150}
              pause={3000}
              eraseMode={'overwrite'}
              emptyPause={3000}
              deletingInterval={150}
              items={filterNulls(props.items)}
            />
            &nbsp;
          </>
      }
    </div>
  );
}
