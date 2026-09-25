import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import {
  absoluteUrl,
  canonicalPath,
  pageTitle as formatTitle,
} from "../lib/seo";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  TWITTER_HANDLE,
} from "../lib/site";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  ogLocale?: string;
  twitterHandle?: string;
  jsonLd?: object | object[];
}

const SEO = ({
  title,
  description,
  canonical,
  ogImage = OG_IMAGE,
  ogType = "website",
  ogLocale = "en_US",
  twitterHandle = TWITTER_HANDLE,
  jsonLd,
}: SEOProps) => {
  const location = useLocation();
  const fullTitle = formatTitle(title);
  const metaDescription = description || SITE_DESCRIPTION;
  const absoluteCanonical = absoluteUrl(
    canonical ?? canonicalPath(location.pathname),
  );
  const absoluteOgImage = absoluteUrl(ogImage);
  const jsonLdBlocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={absoluteCanonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:url" content={absoluteCanonical} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:site" content={twitterHandle} />

      {jsonLdBlocks.map((block, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
