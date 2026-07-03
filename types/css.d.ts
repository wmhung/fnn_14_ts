// Ambient declarations for stylesheet side-effect imports.
// Lets TypeScript accept `import 'x.css'` (e.g. 'leaflet/dist/leaflet.css'),
// which webpack/Next.js handles at build time. Clears ts(2882).
declare module '*.css';
declare module '*.scss';
