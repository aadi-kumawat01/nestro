/* eslint-disable @next/next/no-img-element -- Admin previews may use local object URLs. */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Tag, Link2, Save } from "lucide-react";
import { client, generateSlug } from "@/utils/helper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
  });

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      slug: name === "name" ? generateSlug(value) : prev.slug,
    }));
  };

  const imageHanlder = (event) => {
    setFormData({ ...formData, image: event.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("slug", formData.slug);
      payload.append("image", formData.image);
      const response = await client.post("room-type/create", payload);
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          name: "",
          slug: "",
          image: "",
        });
        router.push("/admin/room-type");
      }
    } catch (error) {
      toast.error(error.response.data.message || "Internal server error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Room</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new product category for your store
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 space-y-6">
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">
                Room Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">
                Slug
              </label>

              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  placeholder="auto-generated-slug"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <p className="text-xs text-gray-400">
                Auto generated from category name.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Image</label>
            <input
              type="file"
              name="image"
              onChange={imageHanlder}
              className="flex w-full items-center justify-center h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
            />

            <div>
              {formData.image && (
                <img
                  src={URL.createObjectURL(formData.image)}
                  className="w-20 h-10"
                  alt=""
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Link
            href="/admin/edit"
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex cursor-pointer items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl"
          >
            <Save className="w-4 h-4" />
            Save Room Type
          </button>
        </div>
      </form>
    </div>
  );
}
