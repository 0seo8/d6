import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporary: Use local files directly instead of rewrite
  // async rewrites() {
  //   return [
  //     {
  //       source: "/data/:path*",
  //       destination:
  //         "https://raw.githubusercontent.com/0seo8/d6/main/frontend/public/data/:path*",
  //     },
  //   ];
  // },
  async headers() {
    return [
      {
        source: "/data/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdnimg.melon.co.kr",
        port: "",
        pathname: "/cm/**",
      },
      {
        protocol: "https",
        hostname: "cdnimg.melon.co.kr",
        port: "",
        pathname: "/cm2/**",
      },
      {
        protocol: "https",
        hostname: "image.genie.co.kr",
        port: "",
        pathname: "/Y/**",
      },
      {
        protocol: "https",
        hostname: "musicmeta-phinf.pstatic.net",
        port: "",
        pathname: "/album/**",
      },
      {
        protocol: "https",
        hostname: "cdn.music-flo.com",
        port: "",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "image.bugsm.co.kr",
        port: "",
        pathname: "/album/**",
      },
    ],
  },
};

export default nextConfig;
