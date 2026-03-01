import { useParams, useLocation, Link } from "react-router-dom";
import { getDocSections } from "../lib/content";
import MarkdownRenderer from "../components/MarkdownRenderer";

const DocContentPage = () => {
  const params = useParams();
  const slug = params["*"];
  const location = useLocation();
  const sections = getDocSections();

  const sectionKey = "/" + location.pathname.split("/")[1];
  const section = sections[sectionKey];

  if (!section) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Section not found
        </h1>
        <Link
          to="/"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Go home
        </Link>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="p-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {section.title}
        </h1>
        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
          {section.description}
        </p>
        <p className="text-zinc-500">
          ← Select a topic from the sidebar to get started.
        </p>
      </div>
    );
  }

  const item = section.items.find((i) => i.slug === slug);

  if (!item) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Topic not found</h1>
        <Link
          to={section.basePath}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Back to {section.title}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-3xl overflow-y-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
        {item.meta.title}
      </h1>
      <MarkdownRenderer content={item.content} />
    </div>
  );
};

export default DocContentPage;
