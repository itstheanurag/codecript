import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { getAllBlogs } from "../lib/content";

const BlogListPage = () => {
  const blogs = getAllBlogs();

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 lobster-two-bold">
            Blog
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl">
            Thoughts, tutorials, and deep dives on software engineering topics.
          </p>
        </div>

        <div className="flex flex-col gap-0 border-t border-white/10">
          {blogs.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group block py-8 border-b border-white/10 transition-colors hover:bg-white/[0.02] -mx-4 px-4 rounded-lg"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-zinc-300 transition-colors mb-2">
                    {post.meta.title}
                  </h2>
                  <p className="text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                    {post.meta.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-zinc-500">{post.meta.date}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Clock size={14} />
                      {post.meta.readTime}
                    </span>
                    {post.meta.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs font-medium bg-white/5 border border-white/10 rounded-md text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hidden md:flex items-center text-zinc-500 group-hover:text-white transition-colors pt-2">
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
