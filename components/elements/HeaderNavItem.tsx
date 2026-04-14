import {
  TAB_BASE_CLASSES,
  TAB_BOTTOM_BORDER_CLASSES,
  TAB_NO_BORDER_CLASSES,
  TAB_PINK_BORDER_CLASSES,
} from 'utils/styles';

import Image from 'next/image';
import React, { ReactElement, useCallback, useState } from 'react';

export interface HeaderNavItemProps {
  active: boolean;
  alt: string;
  logoActive: string | ReactElement;
  logoInactive: string | ReactElement;
  styleClasses: Array<string>;
  onClick?: () => void;
  overrideBorder?: boolean;
}

export function HeaderNavItem(props: HeaderNavItemProps) {
  const { alt, active, logoActive, logoInactive, styleClasses, onClick, overrideBorder } = props;

  const [hovering, setHovering] = useState(false);

  const getTabClasses = useCallback(() => {
    const classes: Array<string> = TAB_BASE_CLASSES.slice();
    if (!overrideBorder) {
      classes.push(...TAB_BOTTOM_BORDER_CLASSES);
    }
    if (active || hovering) {
      classes.push(...TAB_PINK_BORDER_CLASSES);
    } else if (!overrideBorder) {
      classes.push(...TAB_NO_BORDER_CLASSES);
    }
    return classes;
  }, [active, overrideBorder, hovering]);

  const getImageView = useCallback(
    (src: string) => {
      return (
        <Image
          alt={alt}
          onClick={onClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          draggable="false"
          src={src}
          className={[...styleClasses, ...getTabClasses()].join(' ')}
        />
      );
    },
    [alt, onClick, styleClasses, getTabClasses]
  );

  const getActiveView = useCallback(() => {
    if (typeof logoActive === 'string') {
      return getImageView(logoActive);
    } else {
      return React.cloneElement(logoActive, {
        className: [...styleClasses, ...getTabClasses()].join(' '),
        onClick: onClick,
        alt: alt,
        onMouseEnter: () => setHovering(true),
        onMouseLeave: () => setHovering(false),
        draggable: 'false',
      });
    }
  }, [logoActive, getImageView, styleClasses, getTabClasses, onClick, alt]);

  const getInactiveView = useCallback(() => {
    if (typeof logoInactive === 'string') {
      return getImageView(logoInactive);
    } else {
      return React.cloneElement(logoInactive, {
        className: [...styleClasses, ...getTabClasses()].join(' '),
        onClick: onClick,
        alt: alt,
        onMouseEnter: () => setHovering(true),
        onMouseLeave: () => setHovering(false),
        draggable: 'false',
      });
    }
  }, [logoInactive, getImageView, styleClasses, getTabClasses, onClick, alt]);

  return active || hovering ? getActiveView() : getInactiveView();
}
