import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  twitterHandle?: string;
  jsonLd?: object;
}

const SEO = ({
  title,
  description,
  canonical,
  ogImage = "/og-image.png",
  ogType = "website",
  twitterHandle = "@codecript",
  jsonLd,
}: SEOProps) => {
  const siteTitle = "codecript - Learn Coding, Algorithms & System Design";
  const fullTitle = title ? `${title} | codecript` : siteTitle;
  const defaultDescription =
    "Master programming languages, data structures, algorithms, and system design. Your one-stop destination to get job-ready.";
  const metaDescription = description || defaultDescription;
  const url = window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical || url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
