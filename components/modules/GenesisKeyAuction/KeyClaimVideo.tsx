import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { useKeyVideo } from 'hooks/state/useKeyVideo';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { tw } from 'utils/tw';

import { AnimatePresence, motion } from 'framer-motion';
import videoPlaceholder from 'public/reverse_layers_placeholder.webp';
import { useState } from 'react';
import { isMobile } from 'react-device-detect';

export function KeyClaimVideo() {
  const { width, height } = useWindowDimensions();
  const { keyVideoVisible: showVideo, useKeyVideoToggle: toggle } = useKeyVideo();
  const [skipVisible, setSkipVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  return <div
    className={tw(
      'absolute z-50 top-0 left-0 w-full h-full bg-black',
      showVideo ? '' : 'hidden'
    )}
    onMouseOver={() => {
      setSkipVisible(true);
    }}
  >
    <video
      autoPlay={!isMobile}
      muted
      playsInline={!isMobile}
      preload="auto"
      className="z-50 object-cover"
      style={{ height, width }}
      poster={videoPlaceholder.src}
      onEnded={() => {
        setHovering(false);
        setSkipVisible(false);
        toggle();
      }}
    >
      <source
        src={'https://cdn.nft.com/reverse_layers.mp4'}
        type='video/mp4'
      />
    </video>
    <AnimatePresence>
      {
        skipVisible && !isMobile &&
        <motion.div
          key="skip"
          initial={{ opacity: 1 }}
          animate={{ opacity: hovering ? 1 : 0 }}
          onAnimationComplete={() => {
            if (!hovering) {
              setSkipVisible(false);
            }
          }}
          onMouseEnter={() => {
            setHovering(true);
          }}
          onMouseLeave={() => {
            setHovering(false);
          }}
          transition={{ ease: 'linear', duration: 1.5 }}
          className="absolute z-50 bottom-12 right-12"
        >
          <Button
            size={ButtonSize.LARGE}
            label={'Skip'}
            onClick={() => {
              setHovering(false);
              setSkipVisible(false);
              toggle();
            }}
            type={ButtonType.SECONDARY}
          />
        </motion.div>
      }
    </AnimatePresence>
  </div>;
}
