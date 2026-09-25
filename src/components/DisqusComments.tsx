import { useEffect } from 'react';

declare global {
  interface Window {
    disqus_config?: () => void;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: () => void }) => void;
    };
  }
}

export function DisqusComments() {
  useEffect(() => {
    const canonicalUrl = 'https://skylah-disqus-clarity-nu.vercel.app/';
    const identifier = 'home';

    window.disqus_config = function (this: any) {
      this.page.url = canonicalUrl;
      this.page.identifier = identifier;
    };

    const scriptId = 'disqus-embed-script';

    // If Disqus is already loaded on the window, reset it with our page config
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page.url = canonicalUrl;
          this.page.identifier = identifier;
        },
      });
      return;
    }

    // Ensure the script is only appended once to the DOM
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://thisislay.disqus.com/embed.js';
      script.setAttribute('data-timestamp', String(Date.now()));
      script.crossOrigin = 'anonymous';
      script.async = true;
      (document.head || document.body).appendChild(script);
    }
  }, []);

  return (
    <section className="mt-8 pt-6 border-t border-slate-200">
      {/* Invitation line */}
      <p className="text-sm text-slate-600 text-center font-medium mb-4">
        Tell us what worked for you and what did not.
      </p>

      {/* Disqus comment thread container */}
      <div id="disqus_thread" className="min-h-[200px]" />

      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript" className="text-blue-600 underline">
          comments powered by Disqus.
        </a>
      </noscript>
    </section>
  );
}

export default DisqusComments;
