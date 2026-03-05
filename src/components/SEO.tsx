import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  ogLocale?: string;
  twitterHandle?: string;
  jsonLd?: object;
}

const SEO = ({
  title,
  description,
  canonical,
  ogImage = "/og-image.png",
  ogType = "website",
  ogLocale = "en_US",
  twitterHandle = "@codecript",
  jsonLd,
}: SEOProps) => {
  const siteUrl = "https://codecript.pages.dev";
  const siteTitle = "codecript - Learn Coding, Algorithms & System Design";
  const fullTitle = title ? `${title} | codecript` : siteTitle;
  const defaultDescription =
    "Master programming languages, data structures, algorithms, and system design. Your one-stop destination to get job-ready.";
  const metaDescription = description || defaultDescription;
  const path = window.location.pathname || "/";
  const absoluteCanonical = canonical
    ? canonical.startsWith("http")
      ? canonical
      : new URL(canonical, siteUrl).toString()
    : new URL(path, siteUrl).toString();
  const absoluteOgImage = ogImage.startsWith("http")
    ? ogImage
    : new URL(ogImage, siteUrl).toString();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={absoluteCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="codecript" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:url" content={absoluteCanonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
