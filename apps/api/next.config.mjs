/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@fit-tracker/database", "@fit-tracker/types"],

  // Prisma vive hoisted en node_modules/.pnpm por el layout de pnpm en el
  // monorepo, y el output file tracer de Next.js no detecta el binario nativo
  // del query engine (.so.node) ahí — lo deja fuera del bundle de la función
  // serverless y Prisma truena en runtime con "could not locate the Query
  // Engine". Se fuerza su inclusión explícitamente. Ver https://pris.ly/d/engine-not-found-nextjs
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*"],
    },
  },
};

export default nextConfig;
