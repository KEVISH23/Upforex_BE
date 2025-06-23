// server/sitemapGenerator.js
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import dotenv from "dotenv";
import { Blog } from "./models/index.js";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "https://upforex.com";

export async function generateSitemap() {
  const links = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/about", changefreq: "monthly", priority: 0.7 },
    { url: "/contact", changefreq: "monthly", priority: 0.7 },
  ];

  // Fetch blogs for dynamic URLs
  const blogs = await Blog.find({}, "permaLink updatedAt");

  blogs.forEach((blog) => {
    links.push({
      url: `/blog/${blog.permaLink}`,
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
