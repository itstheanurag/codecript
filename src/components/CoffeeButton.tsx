import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Coffee, X, Heart } from "lucide-react";

const CoffeeButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Coffee Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-paper-50/95 backdrop-blur-sm border border-paper-300 text-ink shadow-md hover:border-accent hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer font-sans"
        aria-label="Support CodeCript - Buy me a coffee"
        title="Support CodeCript"
      >
        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-paper-50 transition-colors">
          <Coffee size={14} className="shrink-0 group-hover:rotate-6 transition-transform" />
        </div>
        <span className="text-xs font-semibold text-ink group-hover:text-accent transition-colors hidden sm:inline">
          Buy me a coffee
        </span>
      </button>

      {/* QR Code Modal Overlay */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-paper-50 border border-paper-300 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 flex flex-col items-center text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Icon & Title */}
              <div className="w-11 h-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Coffee size={22} />
              </div>

              <h3 className="text-lg font-bold font-sans text-ink mb-1.5">
                Support CodeCript
              </h3>

              <p className="text-xs sm:text-[13px] text-ink-secondary font-serif leading-relaxed mb-5 max-w-[260px]">
                If these guides help your engineering journey, consider buying a coffee to keep this compendium free and ad-free.
              </p>

              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl border border-paper-300 shadow-inner mb-4">
                <img
                  src="/bmc-qr.png"
                  alt="Buy Me a Coffee QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>

              <p className="text-[11px] font-mono text-ink-muted uppercase tracking-wider mb-2">
                Scan with any camera / UPI app
              </p>

              <div className="flex items-center gap-1.5 text-xs text-ink-muted font-sans pt-3 border-t border-paper-200 w-full justify-center">
                <span>Thank you for reading</span>
                <Heart size={12} className="text-accent fill-accent" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default CoffeeButton;
