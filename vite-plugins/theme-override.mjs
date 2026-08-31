import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALIAS_PREFIX = '@theme/';
export function themeOverridePlugin() {
  const projectRoot = fileURLToPath(new URL('..', import.meta.url));
  const srcDir = path.join(projectRoot, 'src');
  const overridesDir = path.join(srcDir, 'overrides');
  return {
    name: 'theme-override-resolver',
    enforce: 'pre',
    resolveId(source, importer, options) {
      if (!source.startsWith(ALIAS_PREFIX)) return null;
      const rel = source.slice(ALIAS_PREFIX.length);
      const overridePath = path.join(overridesDir, rel);
      const basePath = path.join(srcDir, rel);
      const target = fs.existsSync(overridePath) ? overridePath : basePath;
      return this.resolve(target, importer, { ...options, skipSelf: true });
    },
  };
}
