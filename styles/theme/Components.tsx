import { joinClasses } from 'utils/format';

import * as gtag from 'lib/gtag';
import React, { HTMLProps, useCallback } from 'react';

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  children,
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & {
  href: string;
}) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === '_blank' || event.ctrlKey || event.metaKey) {
        gtag.event({
          category: 'Outbound',
          action: 'click',
          label: href });
      } else {
        event.preventDefault();
        // send a GA event and then trigger a location change
        gtag.event({
          category: 'Outbound',
          action: 'click',
          label: href });
        window.location.href = href;
      }
    },
    [href, target]
  );

  return (
    <a
      className={joinClasses(
        'no-underline cursor-pointer text-primary1 ',
        'font-500 hover:underline border-transparent',
        'focus:border-transparent focus:ring-0',
        'focus:outline-none focus:underline active:no-underline'
      )}
      target={target}
      rel={rel}
      href={href}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
