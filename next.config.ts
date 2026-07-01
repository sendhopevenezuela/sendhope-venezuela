import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl sin locale en URL — request config en src/i18n/request.ts
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
