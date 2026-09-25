import React, { useEffect } from "react";

declare global {
  interface Window {
    disqus_config?: (this: any) => void;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: (this: any) => void }) => void;
    };
  }
}

const PAGE_URL = "https://skylah-disqus-clarity-nu.vercel.app/";
const PAGE_IDENTIFIER = "home";

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    // Configure canonical URL and fixed thread identifier
    window.disqus_config = function (this: any) {
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
    };

    const existingScript = document.getElementById("disqus-embed-script");

    if (!existingScript) {
      // Inject Disqus Universal Code script once
      const script = document.createElement("script");
      script.id = "disqus-embed-script";
      script.src = "https://thisislay.disqus.com/embed.js";
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
