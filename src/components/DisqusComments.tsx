import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    disqus_shortname?: string;
    disqus_identifier?: string;
    disqus_url?: string;
    disqus_config?: (this: any) => void;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: (this: any) => void }) => void;
    };
  }
}

const DISQUS_SHORTNAME = "skylah-weather";
const PAGE_URL = "https://skylah-disqus-clarity-nu.vercel.app/";
const PAGE_IDENTIFIER = "home";

export const DisqusComments: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // 1. Configure Disqus global variables
    window.disqus_shortname = DISQUS_SHORTNAME;
    window.disqus_url = PAGE_URL;
    window.disqus_identifier = PAGE_IDENTIFIER;

    // 2. Configure Disqus configuration function
    window.disqus_config = function (this: any) {
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
      this.callbacks = this.callbacks || {};
      this.callbacks.onReady = this.callbacks.onReady || [];
      this.callbacks.onReady.push(() => {
        setIsLoading(false);
        setHasError(false);
      });
    };

    const scriptId = "disqus-embed-script";
    const targetSrc = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;

    const handleScriptLoad = () => {
      setIsLoading(false);
      setHasError(false);
      // Trigger a scroll check in case Disqus lazy load needs container visibility confirmation
      setTimeout(() => {
        window.dispatchEvent(new Event("scroll"));
      }, 100);
    };

    const handleScriptError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // If DISQUS already exists on window (e.g. re-renders or navigating back to Forecast)
    if (window.DISQUS) {
      // Small timeout to allow React to mount and layout #disqus_thread in DOM
      const timer = setTimeout(() => {
        try {
          window.DISQUS?.reset({
            reload: true,
            config: function (this: any) {
              this.page.url = PAGE_URL;
              this.page.identifier = PAGE_IDENTIFIER;
              this.callbacks = this.callbacks || {};
              this.callbacks.onReady = this.callbacks.onReady || [];
              this.callbacks.onReady.push(() => {
                setIsLoading(false);
                setHasError(false);
              });
            },
          });
          setIsLoading(false);
          window.dispatchEvent(new Event("scroll"));
        } catch (_err) {
          setHasError(true);
          setIsLoading(false);
        }
      }, 50);

      return () => clearTimeout(timer);
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      // Script is already in DOM and loading
      existingScript.addEventListener("load", handleScriptLoad);
      existingScript.addEventListener("error", handleScriptError);

      return () => {
        existingScript.removeEventListener("load", handleScriptLoad);
        existingScript.removeEventListener("error", handleScriptError);
      };
    }

    // Inject Disqus Universal Code script once
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = targetSrc;
    script.setAttribute("data-timestamp", String(+new Date()));
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", handleScriptLoad);
    script.addEventListener("error", handleScriptError);

    (document.head || document.body).appendChild(script);

    return () => {
      script.removeEventListener("load", handleScriptLoad);
      script.removeEventListener("error", handleScriptError);
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);

    const scriptId = "disqus-embed-script";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
    script.setAttribute("data-timestamp", String(+new Date()));
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      setIsLoading(false);
      setHasError(false);
      setTimeout(() => {
        window.dispatchEvent(new Event("scroll"));
      }, 100);
    };
    script.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    (document.head || document.body).appendChild(script);
  };

  return (
    <section
      id="community-feedback-section"
      aria-label="Community Feedback"
      className="mt-8 pt-6 border-t border-slate-200"
    >
      <p className="text-sm text-slate-600 text-center font-medium mb-4">
        Tell us what worked for you and what did not.
      </p>

      {/* Loading feedback */}
      {isLoading && (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Loading discussion forum...
        </div>
      )}

      {/* Helpful banner if ad blocker or privacy shield blocks third-party Disqus scripts */}
      {hasError && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-center space-y-2 mb-4">
          <p className="text-xs text-amber-800 font-medium">
            Could not load Disqus comments. If you are using an ad blocker, tracking protection, or Brave Shields, please allow Disqus or disable protection for this site to view the discussion.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Disqus target container */}
      <div id="disqus_thread" className="w-full min-h-[120px]" />

      <noscript>
        Please enable JavaScript to view the{" "}
        <a href="https://disqus.com/?ref_noscript" rel="nofollow">
          comments powered by Disqus.
        </a>
      </noscript>
    </section>
  );
};
