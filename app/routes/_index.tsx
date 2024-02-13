export default function Homepage() {
  return (
    <div style={{padding: '20px'}}>
      <h1>Shopify Cookie Consent Banner</h1>
      <p>
        To force the consent banner, append{' '}
        <code>?preview_privacy_banner=1</code> to the url or click{' '}
        <a
          style={{textDecoration: 'underline'}}
          href="/?preview_privacy_banner=1"
        >
          here
        </a>
      </p>
    </div>
  );
}
