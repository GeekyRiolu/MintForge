import { Doppler, getEnv } from 'utils/env';

export const FB_PIXEL_ID: string | undefined = getEnv(Doppler.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);

/**
 * Tracks a page view event using Facebook Pixel.
 * @returns None
 */
export const pageview = () => {
  window.fbq('track', 'PageView');
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
/**
 * Sends a Facebook Pixel event with the given name and options.
 * @param {string} name - The name of the event to track.
 * @param {Object} [options={}] - Optional parameters to include with the event.
 * @returns None
 */
export const event = (name, options = {}) => {
  window.fbq('track', name, options);
};
