import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
const allowed = ["privacy", "terms", "shipping", "returns"];
const names = {
  privacy: "Privacy Policy",
  terms: "Terms and Conditions",
  shipping: "Furniture Shipping Policy",
  returns: "Furniture Returns Policy",
};
export async function generateMetadata({ params }) {
  const { kind } = await params;
  if (!allowed.includes(kind)) return {};
  return {
    title: names[kind],
    description: `Read Nestro Furniture's ${names[kind].toLowerCase()} for online furniture orders in India.`,
    alternates: { canonical: `/policies/${kind}` },
  };
}
export default async function Page({ params }) {
  const { kind } = await params;
  if (!allowed.includes(kind)) notFound();
  const base = (
    process.env.API_BASE_URL || "http://localhost:5000/api"
  ).replace(/\/$/, "");
  let settings;
  try {
    const r = await fetch(base + "/commerce/settings", { cache: "no-store" });
    if (!r.ok) throw new Error();
    settings = (await r.json()).data;
  } catch {}
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl mb-6">{names[kind]}</h1>
      <div className="whitespace-pre-wrap leading-8">
        {settings?.policies?.[kind] ||
          "This policy is not available yet. Please contact the store before ordering."}
      </div>
    </main>
  );
}
