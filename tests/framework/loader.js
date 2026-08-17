import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('.') || specifier.startsWith('/'))) {
      const parentUrl = context.parentURL;
      if (parentUrl && parentUrl.startsWith('file://')) {
        const parentPath = fileURLToPath(parentUrl);
        const resolvedPath = path.resolve(path.dirname(parentPath), specifier);
        for (const ext of ['.js', '.jsx', '.json', '/index.js', '/index.jsx']) {
          if (fs.existsSync(resolvedPath + ext)) {
            return {
              shortCircuit: true,
              url: pathToFileURL(resolvedPath + ext).href,
            };
          }
        }
      }
    }
    throw err;
  }
}
