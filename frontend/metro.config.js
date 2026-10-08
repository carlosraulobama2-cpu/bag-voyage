// Peyma... digo, Bag-Vayage — config de Metro
//
// `zustand/middleware` trae devtools+persist+subscribeWithSelector en un
// solo archivo. Su build ESM (zustand/esm/middleware.mjs) usa
// `import.meta.env` para detectar Redux DevTools — sintaxis válida en un
// bundler tipo Vite, pero que Metro no soporta: con el `.mjs` apenas se
// IMPORTA (no hace falta ni llamar a `devtools()`) tira "Cannot use
// 'import.meta' outside a module" y deja de funcionar TODO el toque en
// pantalla (TouchableOpacity/Pressable) en el build web — no se nota en
// una captura estática, sólo al intentar tocar algo.
//
// En nativo, Metro resuelve la condición "react-native" del package.json
// de zustand y cae sola en el build CJS (sin import.meta), por eso esto
// sólo se ve en `expo start --web` / `expo export --platform web`. El fix
// es forzar esa misma resolución CJS también para web.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const zustandMiddlewareCjs = path.join(__dirname, 'node_modules', 'zustand', 'middleware.js');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand/middleware') {
    return { type: 'sourceFile', filePath: zustandMiddlewareCjs };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
