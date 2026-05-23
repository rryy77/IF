import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  /** Supabase の vendor chunk 欠落エラーを防ぐ（dev の .next 破損時も再ビルドで復旧） */
  serverExternalPackages: ["@supabase/supabase-js"],
};

export default nextConfig;
