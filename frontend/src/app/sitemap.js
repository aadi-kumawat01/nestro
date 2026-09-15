export const revalidate = 3600;

const staticPaths = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/store", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/policies/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/policies/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/policies/shipping", changeFrequency: "monthly", priority: 0.4 },
  { path: "/policies/returns", changeFrequency: "monthly", priority: 0.4 },
];
const catalogPage = async (api, page) => {
  const response = await fetch(`${api}/product?limit=100&page=${page}`, {
    next: { revalidate },
  });
  if (!response.ok) throw new Error("Catalog sitemap fetch failed");
  return response.json();
};

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const api = (process.env.API_BASE_URL || "http://localhost:5000/api").replace(
    /\/$/,
    "",
  );
  const entries = staticPaths.map(({ path, ...meta }) => ({
    url: base + path,
    ...meta,
  }));
  try {
    const first = await catalogPage(api, 1);
    const pages = Math.max(1, Number(first.pages) || 1);
    const records = [...(first.data || [])];
    // Ten concurrent pages avoid a long serial sitemap response without overwhelming the API.
    for (let start = 2; start <= pages; start += 10) {
      const batch = Array.from(
        { length: Math.min(10, pages - start + 1) },
        (_, index) => catalogPage(api, start + index),
      );
      for (const result of await Promise.all(batch))
        records.push(...(result.data || []));
    }
    for (const product of records)
      entries.push({
        url: `${base}/store/${product._id}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
  } catch {
    // Static public pages remain discoverable while the catalog API is unavailable.
  }
  return entries;
}
