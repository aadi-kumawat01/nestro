"use client";
import { useEffect, useState } from "react";
import { client } from "@/utils/helper";
export default function CustomerReviews() {
  const [data, setData] = useState([]);
  useEffect(() => {
    client
      .get("commerce/reviews", { params: { limit: 3 } })
      .then((r) => setData(r.data.data))
      .catch(() => {});
  }, []);
  if (!data.length) return null;
  return (
    <section className="p-6 sm:p-10 bg-[#f0ebe3]">
      <h2 className="text-3xl mb-6">From our customers</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {data.map((r) => (
          <blockquote key={r._id} className="bg-white rounded-xl p-6">
            <p>{r.comment}</p>
            <footer className="mt-4">
              {r.user?.name} · {r.rating}/5 · Verified purchase
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
