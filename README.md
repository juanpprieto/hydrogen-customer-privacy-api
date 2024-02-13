# Hydrogen example: Shopify Cookie Consent Banner

This folder contains an example implementation of the [Shopify Cookie Banner](https://shopify.dev/docs/api/customer-privacy#installation-on-a-custom-storefront) based on the [Customer Privacy API](https://shopify.dev/docs/api/customer-privacy#installation-on-a-custom-storefront.

More specifically, this example demonstrates how to load an admin-customizable banner that allows merchants to accept or reject marketing tracking cookies.

## Key files

This folder contains the minimal set of files needed to showcase the implementation.
Files that aren’t included by default with Hydrogen and that you’ll need to
create are labeled with 🆕.

| File                                                 | Description                               |
| ---------------------------------------------------- | ----------------------------------------- |
| 🆕 [`app/components/ShopifyCookieBanner.tsx`](app/components/ShopifyCookieBanner.tsx) | A component that loads the Shopify cookie banner |
| [`app/root.tsx`](app/root.tsx) | The root layout modified to display the consent banner |

> [!NOTE]
> During development, you can force the banner by passing `?preview_privacy_banner=1`

## Instructions

### 1. Link your store to inject the required environment variables

```bash
h2 link
```

### 2. Environment variables

Add the `PUBLIC_CHECKOUT_DOMAIN` environment to your local .env and admin.

```diff
+ PUBLIC_CHECKOUT_DOMAIN="checkout.hydrogen.shop"
```

### 3. Modify `remix.env.d.ts` (TypeScript only)

Add the `PUBLIC_CHECKOUT_DOMAIN` variable to the `Env` interface inside `remix.d.ts`

```diff
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
+   PUBLIC_CHECKOUT_DOMAIN: string;
  }
```

[View the complete component file](remix.env.d.ts) to see these updates in context.

### 3. Create the `ShopifyCookieBanner.tsx` component

Create `ShopifyCookieBanner.tsx` inside `app/components/`

```ts
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
```

[View the complete component file](app/components/ShopifyCookieBanner.tsx) to see these updates in context.

### 4. Modify `root.tsx` to render the banner component

Import the `ShopifyCookieBanner` component in `app/root.tsx`

```diff
+ import {ShopifyCookieBanner} from '~/components/ShopifyCookieBanner';
```

Pass the required environment variables to the client by returning them from the loader

```diff
export async function loader({context}: LoaderFunctionArgs) {
   // other code ...

  return defer(
    {
      cart: cartPromise,
      isLoggedIn: isLoggedInPromise,
+     env: {
+       publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
+       checkoutRootDomain: env.PUBLIC_CHECKOUT_DOMAIN,
+       storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
+       storefrontRootDomain: env.PUBLIC_STORE_DOMAIN,
+     },
    },
    {
      headers: {
        'Set-Cookie': await context.session.commit(),
      },
    },
  );
}
```

Render the `ShopifyCookieBanner` component inside the root layout

```diff
export default function App() {
  const nonce = useNonce();
+ const {env} = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
+       <ShopifyCookieBanner
+         checkoutRootDomain={env.checkoutRootDomain}
+         shopDomain={env.publicStoreDomain}
+         storefrontAccessToken={env.storefrontAccessToken}
+         storefrontRootDomain={env.storefrontRootDomain}
+       />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}
```

### 5. Add privacy domain to the Content Security Policy (If applicable)

If CSP is enabled, modify `/app/entry.server.tsx` like so  

```diff
- const {nonce, header, NonceProvider} = createContentSecurityPolicy()
+ const {nonce, header, NonceProvider} = createContentSecurityPolicy({
+   connectSrc: [
+     'https://checkout.hydrogen.shop/api/unstable/graphql.json',
+     'https://privacy-banner.shopifyapps.com/customization',
+   ],
+ });
```

[View the complete component file](app/entry.server.tsx) to see these updates in context.

## Customizing the default banner

You can customize the look and feel of the banner via the Shopify admin by going to 
`Settings > Customer Privacy > Cookie Banner`

## Advanced

In addition to the standard Shopify banner, the Customer Privacy API allows you to build a [custom cookie consent banner](https://shopify.dev/docs/api/customer-privacy#collect-and-register-consent) for your storefront or [guard certain activities behind consent](https://shopify.dev/docs/api/customer-privacy#verify-data-processing-permission).
