import React from "react";
import { formatSingaporeDate } from "../data/weatherData";

interface FooterAttributionProps {
  retrievedAt?: string | null;
}

export const FooterAttribution: React.FC<FooterAttributionProps> = ({ retrievedAt }) => {
  const accessDate = retrievedAt
    ? formatSingaporeDate(retrievedAt)
    : "14 September 2026";

  return (
    <footer
      id="data-gov-sg-attribution-footer"
      className="mt-8 pt-4 pb-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2 px-2"
    >
      <p className="leading-relaxed">
        Contains information from{" "}
        <a
          href="https://data.gov.sg/datasets/d_3f9e064e25005b0e42969944ccaf2e7a/view"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 underline font-medium hover:text-sky-900 focus:outline-hidden"
        >
          2-hour Weather Forecast
        </a>{" "}
        accessed on {accessDate} from data.gov.sg which is made available under the terms of the{" "}
        <a
          href="https://data.gov.sg/open-data-licence"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 underline font-medium hover:text-sky-900 focus:outline-hidden"
        >
          Singapore Open Data Licence version 1.0
        </a>
        .
      </p>

      <p className="leading-relaxed text-slate-500">
        This page uses Microsoft Clarity and Disqus, which use cookies to record how visitors
        use the site and to host comments. By using this page you agree that we and Microsoft
        may collect and use this data. See the{" "}
        <a
          href="https://www.microsoft.com/privacy/privacystatement"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 underline font-medium hover:text-sky-900 focus:outline-hidden"
        >
          Microsoft Privacy Statement
        </a>
        , the{" "}
        <a
          href="https://disqus.com/privacy-policy/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 underline font-medium hover:text-sky-900 focus:outline-hidden"
        >
          Disqus privacy policy
        </a>{" "}
        and the{" "}
        <a
          href="https://disqus.com/data-sharing-settings/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 underline font-medium hover:text-sky-900 focus:outline-hidden"
        >
          Disqus data sharing settings
        </a>
        .
      </p>
    </footer>
  );
};
