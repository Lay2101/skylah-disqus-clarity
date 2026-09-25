import React, { useEffect } from "react";

declare global {
  interface Window {
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
  useEffect(() => {
    // Configure canonical URL and fixed thread identifier
    window.disqus_config = function (this: any) {
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
    };

    const scriptId = "disqus-embed-script";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    const targetSrc = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;

    if (existingScript && existingScript.src !== targetSrc) {
      existingScript.remove();
    }

    if (!document.getElementById(scriptId)) {
      // Inject Disqus Universal Code script once
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = targetSrc;
      script.setAttribute("data-timestamp", String(+new Date()));
      script.async = true;
      (document.head || document.body).appendChild(script);
    } else if (window.DISQUS) {
      // Re-initialize thread if script already loaded and component remounts
      window.DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page.url = PAGE_URL;
          this.page.identifier = PAGE_IDENTIFIER;
        },
      });
    }
  }, []);

  return (
    <section
      id="community-feedback-section"
      aria-label="Community Feedback"
      className="mt-8 pt-6 border-t border-slate-200"
    >
      <p className="text-sm text-slate-600 text-center font-medium mb-4">
        Tell us what worked for you and what did not.
      </p>
      <div id="disqus_thread" className="min-h-[200px]" />
    </section>
  );
};
