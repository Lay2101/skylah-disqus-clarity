import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    disqus_config?: (this: {
      page: {
        url: string;
        identifier: string;
      };
    }) => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: {
          page: {
            url: string;
            identifier: string;
          };
        }) => void;
      }) => void;
    };
  }
}

export function DisqusComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canonicalUrl = 'https://skylah.vercel.app/';
    const identifier = 'home';

    // Standard Universal Disqus configuration callback
    window.disqus_config = function () {
      this.page.url = canonicalUrl;
      this.page.identifier = identifier;
    };

    const scriptId = 'disqus-embed-script';

    // If DISQUS is already initialized in the window, reset the embed with current config
    if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.url = canonicalUrl;
            this.page.identifier = identifier;
          },
        });
      } catch (e) {
        console.error('DISQUS reset error:', e);
      }
      return;
    }

    // Load Disqus embed script if not already present in DOM
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://thisislay.disqus.com/embed.js';
      script.setAttribute('data-timestamp', String(Date.now()));
      script.async = true;

      script.onerror = (err) => {
        console.error('Disqus script failed to load from https://thisislay.disqus.com/embed.js:', err);
      };

      (document.head || document.body).appendChild(script);
    } else if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.url = canonicalUrl;
            this.page.identifier = identifier;
          },
        });
      } catch (e) {
        console.error('DISQUS reset error:', e);
      }
    }
  }, []);

  return (
    <section className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-8 mt-6 border-t border-slate-200">
      {/* Invitation title line */}
      <h3 className="text-gray-800 dark:text-gray-200 text-base sm:text-lg font-semibold mb-6 text-center sm:text-left">
        Please let us know what worked for you and what did not.
      </h3>

      {/* Disqus comment thread container */}
      {/* Disqus inspects getComputedStyle text & background colors to set its theme, but crashes on Tailwind v4's oklch() color format. Plain hex colors prevent parseColor errors. */}
      <div
        id="disqus_thread"
        ref={containerRef}
        className="w-full min-h-[360px]"
        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
      />

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
