import { Doppler, getEnv } from 'utils/env';

import { isMobile } from 'react-device-detect';

export type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
  eventParams?: any;
}

export type OutboundLink = {
  url: string;
  hitCallback: () => void;
}

export const GA_TRACKING_ID: string | undefined = getEnv(Doppler.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID);

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
/**
 * Send a pageview to Google Analytics.
 * @param {string} url - the url of the pageview.
 * @returns None
 */
export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
        ? 'mobileWeb3'
        : 'mobileRegular',
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
/**
 * Send an event to Google Analytics.
 * @param {GTagEvent} event - The event to send.
 * @returns None
 */
export const event = ({ action, category, label, value, eventParams }: GTagEvent) => {
  const extraParams = value ? { value, ...eventParams } : eventParams;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    ...extraParams
  });
};
