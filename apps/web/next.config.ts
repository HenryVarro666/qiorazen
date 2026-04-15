import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: ["@qiorazen/tcm-engine", "@qiorazen/types"],
};

export default withNextIntl(nextConfig);
