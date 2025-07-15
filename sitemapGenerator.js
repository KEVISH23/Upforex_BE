// server/sitemapGenerator.js
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import dotenv from "dotenv";
import { Blog } from "./models/index.js";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "https://www.upforex.com";

export async function generateSitemap() {
  const links = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/about-us", changefreq: "monthly", priority: 0.8 },
    { url: "/contact-us", changefreq: "monthly", priority: 0.8 },
    { url: "/risk-disclosure", changefreq: "yearly", priority: 0.5 },
    { url: "/anti-monry-laundering", changefreq: "yearly", priority: 0.5 },
    { url: "/privacy-policy", changefreq: "yearly", priority: 0.5 },
    { url: "/blogs", changefreq: "weekly", priority: 0.9 },

    // Products
    { url: "/products/forex", changefreq: "weekly", priority: 0.7 },
    { url: "/products/us-stocks", changefreq: "weekly", priority: 0.7 },
    { url: "/products/precious-metal", changefreq: "weekly", priority: 0.7 },
    { url: "/products/index-future", changefreq: "weekly", priority: 0.7 },
    { url: "/products/energy-future", changefreq: "weekly", priority: 0.7 },
    {
      url: "/products/cryptocurrencies-cfd",
      changefreq: "weekly",
      priority: 0.7,
    },

    // Resources
    {
      url: "/resources/introduction-to-forex",
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      url: "/resources/trading-glossary",
      changefreq: "monthly",
      priority: 0.6,
    },
    { url: "/resources/trading-rules", changefreq: "monthly", priority: 0.6 },
    {
      url: "/resources/contract-specifications",
      changefreq: "monthly",
      priority: 0.6,
    },

    // Platforms
    { url: "/platforms/mt5", changefreq: "monthly", priority: 0.7 },

    // Partnerships
    { url: "/partnerships", changefreq: "monthly", priority: 0.7 },
    {
      url: "/partnerships/social-trading",
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      url: "/partnerships/education-partners",
      changefreq: "monthly",
      priority: 0.7,
    },

    // Accounts
    { url: "/accounts", changefreq: "monthly", priority: 0.7 },
  ];

  // Fetch blogs for dynamic URLs
  const blogs = await Blog.find({}, "permaLink updatedAt");

  blogs.forEach((blog) => {
    links.push({
      url: `/blogs/${blog.permaLink}`,
      changefreq: "weekly",
      priority: 0.8,
      lastmodISO: blog.updatedAt.toISOString(),
    });
  });

  const stream = new SitemapStream({ hostname: BASE_URL });
  const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(
    (data) => data.toString()
  );

  return xml;
}
