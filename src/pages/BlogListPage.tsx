import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { getAllBlogs } from "../lib/content";
import SEO from "../components/SEO";

const BlogListPage = () => {
  const blogs = getAllBlogs();

  return (
    <div className="py-20">
      <SEO
        title="Blog"
        description="Deep dives, tutorials, and thoughts on software engineering, algorithms, and system design."
      />
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-50 mb-4 lobster-two-bold">
            Blog
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl">
            Thoughts, tutorials, and deep dives on software engineering topics.
          </p>
        </div>

        <div className="flex flex-col gap-0 border-t border-neutral-800">
          {blogs.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block py-8 border-b border-neutral-800 transition-colors hover:bg-neutral-900/50 -mx-4 px-4 rounded-lg"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-neutral-50 group-hover:text-neutral-300 transition-colors mb-2">
                    {post.meta.title}
                  </h2>
                  <p className="text-neutral-400 leading-relaxed mb-3 line-clamp-2">
                    {post.meta.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-neutral-500">{post.meta.date}</span>
                    <span className="text-neutral-800">·</span>
                    <span className="text-neutral-500 flex items-center gap-1">
                      <Clock size={14} />
                      {post.meta.readTime}
                    </span>
                    {post.meta.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs font-medium bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden md:flex items-center text-neutral-500 group-hover:text-neutral-50 transition-colors pt-2">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;
