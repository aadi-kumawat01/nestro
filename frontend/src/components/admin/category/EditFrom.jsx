/* eslint-disable @next/next/no-img-element -- Admin previews may use local object URLs. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  Link2,
  Save,
  ImagePlus,
  UploadCloud,
  Layers3,
  Loader2,
} from "lucide-react";

import { client, generateSlug } from "@/utils/helper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditForm({ data, api, page }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: data?.name || "",
    slug: data?.slug || "",
    image: null,
  });

  const [preview, setPreview] = useState(data?.image || "");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview?.startsWith?.("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,

      slug: name === "name" ? generateSlug(value) : prev.slug,
    }));
  };

  const imageHandler = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");

      return;
    }

    if (preview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFormData((prev) => ({
      ...prev,

      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!formData.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (formData.image instanceof File) {
        const payload = new FormData();

        payload.append("name", formData.name.trim());

        payload.append("slug", formData.slug);

        payload.append("image", formData.image);

        response = await client.put(api, payload);
      } else {
        const payload = {
          name: formData.name.trim(),
          slug: formData.slug,
        };

        response = await client.put(api, payload);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Category updated successfully");

        router.push(page);

        router.refresh();
      } else {
        toast.error(response.data?.message || "Unable to update category");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Internal server error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6a43]">
              Catalog Management
            </p>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
                <Layers3 size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#2b1b11] sm:text-3xl">
                  Edit Category
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-[#786454]">
                  Update the category name, URL slug and storefront image.
                </p>
              </div>
            </div>
          </div>

          <Link
            href={page}
            className="
                            inline-flex
                            min-h-11
                            w-full
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-[#d8c8b8]
                            bg-white
                            px-5
                            text-sm
                            font-medium
                            text-[#5c4535]
                            transition
                            hover:bg-[#f3ede5]
                            hover:text-[#8b5e3c]
                            sm:w-auto
                        "
          >
            <ArrowLeft size={17} />
            Back to Categories
          </Link>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <div className="flex items-start gap-3 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
              <Tag size={18} />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#2b1b11] sm:text-[16px]">
                Category Details
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
                Update the customer-facing name and category URL.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="min-w-0">
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-[#5c4535]"
                >
                  Category Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Tag
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8775]"
                  />

                  <input
                    id="category-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sofas"
                    required
                    className="
                                            h-12
                                            w-full
                                            rounded-xl
                                            border
                                            border-[#d8c8b8]
                                            bg-[#fffdfa]
                                            pl-11
                                            pr-4
                                            text-sm
                                            text-[#2b1b11]
                                            outline-none
                                            transition
                                            placeholder:text-[#aa998a]
                                            focus:border-[#8b5e3c]
                                            focus:ring-2
                                            focus:ring-[#8b5e3c]/10
                                        "
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-[#8f7a68]">
                  This name will be visible to customers throughout the store.
                </p>
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-medium text-[#5c4535]"
                >
                  Slug
                </label>

                <div className="relative">
                  <Link2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9c8775]"
                  />

                  <input
                    id="category-slug"
                    type="text"
                    name="slug"
                    value={formData.slug}
                    readOnly
                    placeholder="auto-generated-slug"
                    className="
                                            h-12
                                            w-full
                                            cursor-not-allowed
                                            rounded-xl
                                            border
                                            border-[#ded5cb]
                                            bg-[#f3ede5]
                                            pl-11
                                            pr-4
                                            text-sm
                                            text-[#786454]
                                            outline-none
                                        "
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-[#8f7a68]">
                  Automatically generated when the category name changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <div className="flex items-start gap-3 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
              <ImagePlus size={18} />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#2b1b11] sm:text-[16px]">
                Category Image
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
                Upload a clear image that represents this product category.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5c4535]">
                Upload Image
              </label>

              <label
                className="
                                    flex
                                    min-h-[220px]
                                    cursor-pointer
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-[#cdb9a5]
                                    bg-[#faf8f4]
                                    px-6
                                    text-center
                                    transition
                                    hover:border-[#8b5e3c]
                                    hover:bg-[#f7f2ec]
                                "
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe3] text-[#8b5e3c]">
                  <UploadCloud size={23} />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#2b1b11]">
                  Choose category image
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-[#8f7a68]">
                  Click to select JPG, PNG or WEBP from your device.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#8b5e3c] px-4 py-2.5 text-xs font-semibold text-white">
                  <ImagePlus size={15} />
                  Browse Image
                </span>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={imageHandler}
                  className="hidden"
                />
              </label>

              {formData.image instanceof File && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="truncate text-xs font-medium text-emerald-700">
                    Selected: {formData.image.name}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5c4535]">
                Preview
              </label>

              <div className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#f3ede5]">
                <div className="aspect-square w-full">
                  {preview ? (
                    <img
                      src={preview}
                      alt={formData.name || "Category preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
                      <ImagePlus size={28} className="text-[#b49a83]" />

                      <p className="mt-3 text-sm font-medium text-[#786454]">
                        No image
                      </p>

                      <p className="mt-1 text-xs text-[#9b897b]">
                        Upload an image to preview it here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#e8ded0] bg-[#fffdfa] px-4 py-3">
                  <p className="text-xs text-[#8f7a68]">
                    Storefront category image
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky bottom-4 z-20 rounded-2xl border border-[#e8ded0] bg-[#fffdfa]/95 p-4 shadow-lg backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2b1b11]">
                Save category changes
              </p>

              <p className="mt-1 text-xs text-[#8f7a68]">
                Review the category details before updating.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={page}
                className="
                                    inline-flex
                                    min-h-11
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-[#d8c8b8]
                                    bg-white
                                    px-6
                                    text-sm
                                    font-medium
                                    text-[#5c4535]
                                    transition
                                    hover:bg-[#f3ede5]
                                "
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="
                                    inline-flex
                                    min-h-11
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#8b5e3c]
                                    px-7
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-[#70482e]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Category
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}
