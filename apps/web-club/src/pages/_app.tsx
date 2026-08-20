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
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
