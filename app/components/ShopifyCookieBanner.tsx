import {Script} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';

declare global {
  interface Window {
    privacyBanner: {
      loadBanner: (options: PrivacyConsentBannerProps) => void;
    };
  }
}

type PrivacyConsentBannerProps = {
  checkoutRootDomain: string;
  shopDomain: string;
  storefrontAccessToken: string;
  storefrontRootDomain: string;
};

/**
 * A component that loads the Shopify privacy consent banner.
 * @param props - The props to pass to the privacy consent banner.
 * @returns A component that loads the Shopify privacy consent banner.
 * @link https://shopify.dev/docs/api/customer-privacy#installation-on-a-custom-storefront
 * @example while testing you can force the banner pass ?preview_privacy_banner=1
 */
export function ShopifyCookieBanner(props: PrivacyConsentBannerProps) {
  const loaded = useRef(false);

  useEffect(() => {
    if (!window?.privacyBanner || loaded.current) {
      return;
    }
    window?.privacyBanner?.loadBanner(props);
    loaded.current = true;
  }, [props]);

  // NOTE: load the script regardless the need for consent or not
  return (
    <Script
      id="consent-privacy-banner"
      src="https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js"
      async={false}
    />
  );
}
