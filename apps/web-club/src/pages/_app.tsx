import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');

        :root {
          --color-void: #000000;
          --color-ash: #cccccc;
          --color-frost: #ffffff;
          --color-graphite: #4c4c4c;
          --color-crimson-signal: #fc1c46;

          --font-sui: 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

          --radius-full: 9999px;
          --radius-cards: 0px;
          --radius-inputs: 0px;
          --radius-buttons: 9999px;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          overflow-x: hidden;
        }

        body {
          background-color: var(--color-void);
          color: var(--color-ash);
          font-family: var(--font-sui);
          font-weight: 400;
          font-size: 14px;
          line-height: 1.15;
          min-height: 100vh;
          overflow-x: hidden;
        }

        ::selection {
          background-color: var(--color-crimson-signal);
          color: var(--color-frost);
        }

        input, select, textarea, button {
          font-family: var(--font-sui);
          outline: none;
        }

        select option {
          background-color: var(--color-void);
          color: var(--color-frost);
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: var(--color-void);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--color-graphite);
        }

        /* ── Landing Mobile Fixes (max-width 768px) ── */
        @media (max-width: 768px) {
          /* Header */
          .landing-header {
            padding: 0 18px !important;
            height: 60px !important;
          }
          .landing-header-logo-sub {
            display: none !important;
          }
          .landing-header-btn-outline {
            display: none !important;
          }
          .landing-header-btn-cta {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }

          /* Hero — full width, top padding for fixed header */
          .landing-hero {
            padding: 96px 18px 56px !important;
            min-height: 100svh !important;
          }
          .landing-hero-inner {
            max-width: 100% !important;
          }

          /* Generic section padding */
          .landing-section {
            padding: 60px 18px !important;
          }

          /* Download section: collapse to single column */
          .landing-download-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }

          /* Club CTA section */
          .landing-clubs-grid {
            gap: 36px !important;
          }

          /* City text: prevent horizontal overflow */
          .landing-city-text {
            flex-direction: column !important;
            gap: 0 !important;
          }

          /* Footer */
          .landing-footer {
            padding: 28px 18px !important;
          }
          .landing-footer-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }
        }

        @media (max-width: 480px) {
          .landing-header-logo {
            font-size: 20px !important;
          }
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
