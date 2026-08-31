import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIRTUAL_SPECIFIER = '@theme-styles/site.css';
const RESOLVED_EMPTY_ID = '\0' + VIRTUAL_SPECIFIER;
export function themeStylesOverridePlugin() {
  const projectRoot = fileURLToPath(new URL('..', import.meta.url));
  const overrideCssPath = path.join(projectRoot, 'src', 'overrides', 'styles', 'site.css');
  return {
    name: 'theme-styles-override-resolver',
    enforce: 'pre',
    resolveId(source) {
      if (source !== VIRTUAL_SPECIFIER) return null;
      return fs.existsSync(overrideCssPath) ? overrideCssPath : RESOLVED_EMPTY_ID;
    },
    load(id) {
      if (id !== RESOLVED_EMPTY_ID) return null;
      return '/* no site.css override present */';
    },
  };
}
