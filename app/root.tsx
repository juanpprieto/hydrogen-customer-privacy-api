import {useNonce} from '@shopify/hydrogen';
import {
  defer,
  type SerializeFrom,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  useMatches,
  useRouteError,
  useLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
} from '@remix-run/react';
import favicon from '../public/favicon.svg';
import resetStyles from './styles/reset.css';
import appStyles from './styles/app.css';

// 1. Import the ShopifyCookieBanner component
import {ShopifyCookieBanner} from '~/components/ShopifyCookieBanner';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

export function links() {
  return [
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * Access the result of the root loader from a React component.
 */
export const useRootLoaderData = () => {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
};

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount, cart, env} = context;
  const isLoggedInPromise = customerAccount.isLoggedIn();

  // defer the cart query by not awaiting it
  const cartPromise = cart.get();

  return defer(
    {
      cart: cartPromise,
      isLoggedIn: isLoggedInPromise,
      // 2. Return the environment variables required by the ShopifyCookieBanner component
      env: {
        publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
        checkoutRootDomain: env.PUBLIC_CHECKOUT_DOMAIN,
        storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        storefrontRootDomain: env.PUBLIC_STORE_DOMAIN,
      },
    },
    {
      headers: {
        'Set-Cookie': await context.session.commit(),
      },
    },
  );
}

export default function App() {
  const nonce = useNonce();
  const {env} = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        {/* 3. Render the ShopifyCookieBanner component with the environment variables */}
        <ShopifyCookieBanner
          checkoutRootDomain={env.checkoutRootDomain}
          shopDomain={env.publicStoreDomain}
          storefrontAccessToken={env.storefrontAccessToken}
          storefrontRootDomain={env.storefrontRootDomain}
        />
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

export function ErrorBoundary() {
  const error = useRouteError();
  const nonce = useNonce();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="route-error">
          <h1>Oops</h1>
          <h2>{errorStatus}</h2>
          {errorMessage && (
            <fieldset>
              <pre>{errorMessage}</pre>
            </fieldset>
          )}
        </div>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}
