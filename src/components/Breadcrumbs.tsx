import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getDocSections } from "../lib/content";

const Breadcrumbs = () => {
  const location = useLocation();
  const sections = getDocSections();
  
  const pathnames = location.pathname.split("/").filter((x) => x);
  
  // Helper to get formatted title for a segment
  const getSegmentTitle = (segment: string, type: 'section' | 'group' | 'item') => {
    if (type === 'section') {
      const section = sections[`/${segment}`];
      return section ? section.title : segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    if (type === 'group') {
      // Clean numbers from group names (e.g. "01-basics" -> "Basics")
      const cleanGroup = segment.replace(/^\d+-/, "");
      return cleanGroup.charAt(0).toUpperCase() + cleanGroup.slice(1);
    }
    
    // For items, split by hyphens, remove leading numbers, and capitalize
    return segment
      .replace(/^\d+-/, "")
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-neutral-50 transition-colors"
      >
        <Home size={14} />
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        
        let type: 'section' | 'group' | 'item' = 'item';
        if (index === 0) type = 'section';
        else if (index === 1 && pathnames.length > 2) type = 'group';

        const title = getSegmentTitle(value, type);

        return (
          <div key={to} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="shrink-0 text-neutral-700" />
            {last ? (
              <span className="text-neutral-300 truncate max-w-[150px] sm:max-w-none">
                {title}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-neutral-50 transition-colors"
              >
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
