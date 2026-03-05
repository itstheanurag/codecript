import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { getBlogBySlug } from "../lib/content";
import MarkdownRenderer from "../components/MarkdownRenderer";
import SEO from "../components/SEO";

const BlogReadPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-4xl font-bold text-neutral-50 mb-4">
          Post not found
        </h1>
        <p className="text-neutral-400 mb-8">
          The blog post you're looking for doesn't exist.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-neutral-300 hover:text-neutral-50 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to all posts
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.meta.title,
    "description": post.meta.excerpt,
    "datePublished": post.meta.date,
    "author": {
      "@type": "Person",
      "name": "Anurag" // Fallback or from meta if available
    },
    "publisher": {
      "@type": "Organization",
      "name": "codecript",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/og-image.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  return (
    <div className="py-16">
      <SEO
        title={post.meta.title}
        description={post.meta.excerpt}
        ogType="article"
        jsonLd={jsonLd}
      />
      <article className="max-w-3xl mx-auto px-6">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-50 transition-colors mb-10 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          All Posts
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-4">
            <span>{post.meta.date}</span>
            <span className="text-neutral-800">·</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.meta.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-neutral-50 mb-6 leading-tight">
            {post.meta.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {post.meta.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="border-t border-neutral-800 pt-10">
          <MarkdownRenderer content={post.content} />
        </div>

        <div className="border-t border-neutral-800 mt-16 pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-50 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogReadPage;
