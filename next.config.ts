import type { NextConfig } from "next";

let staticFilePatterns = [];
if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
  staticFilePatterns = [
    { protocol: "https", hostname: "picsum.photos" } as const,
    { protocol: "https", hostname: "static.kingface.ai" } as const,
  ];
} else {
  staticFilePatterns = [
    { protocol: "https", hostname: "picsum.photos" } as const,
  ];
}

let localhostImagePatterns: {
  protocol: "https" | "http";
  hostname: "localhost";
  port: string;
}[] = [];
if (process.env.NODE_ENV === "development") {
  localhostImagePatterns = [
    {
      protocol: "https",
      hostname: "localhost",
      port: "8443",
    } as const,
    {
      protocol: "http",
      hostname: "localhost",
      port: "3000",
    } as const,
  ];
}

export const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [...localhostImagePatterns, ...staticFilePatterns],
    dangerouslyAllowSVG: true,
  },
  webpack(config, { webpack }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.jsx",
        },
      },
    },
    serverActions: {
      bodySizeLimit: "7mb",
    },
  },
};
