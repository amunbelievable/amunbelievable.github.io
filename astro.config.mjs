import { defineConfig } from 'astro/config';

// GitHub Pages configuration.
// TODO (when Anton's GitHub repo exists), set these:
//   - User/Org site repo named "<username>.github.io"  -> site: 'https://<username>.github.io'  (no base)
//   - Project repo named "<repo>"                       -> site: 'https://<username>.github.io', base: '/<repo>'
// The placeholder below lets the build succeed until then.
export default defineConfig({
  site: 'https://example.github.io',
  // base: '/<repo>', // uncomment & set ONLY for a project repository
});
