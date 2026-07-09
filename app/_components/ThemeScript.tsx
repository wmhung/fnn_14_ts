// Blocking script that applies the saved (or system) dark-mode preference
// before first paint, preventing a flash of the wrong theme (anti-FOUC).
// Rendered in <head> from the root layout.
export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            try {
              const theme = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && prefersDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          })();
        `,
      }}
    />
  );
}
