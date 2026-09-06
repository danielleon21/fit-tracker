/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@fit-tracker/types"],

  // Sin dominio propio, apps/web y apps/api quedan en dos dominios *.vercel.app
  // distintos — la cookie de sesión (sameSite: "lax") nunca viajaría en un
  // fetch() entre esos dos orígenes, sin importar qué tan permisivo sea CORS.
  // Este rewrite hace que el navegador solo hable con el dominio de apps/web:
  // las llamadas a /api/* se reenvían del lado del servidor hacia el
  // deployment real de apps/api, así que para el navegador todo es un único
  // origen y la cookie se guarda "host-only" sin fricción.
  //
  // API_ORIGIN se define solo en producción (Vercel), apuntando al dominio del
  // proyecto de apps/api (ej. "https://fit-tracker-api.vercel.app"). En local
  // queda sin definir y este rewrite no aplica: apps/web sigue llamando
  // directo a NEXT_PUBLIC_API_URL (http://localhost:3001).
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN;
    if (!apiOrigin) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
