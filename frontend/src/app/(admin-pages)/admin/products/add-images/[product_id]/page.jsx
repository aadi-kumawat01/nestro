/* eslint-disable @next/next/no-img-element -- Admin previews may use local object URLs. */
"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/utils/helper";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Images,
  ImagePlus,
  UploadCloud,
  Trash2,
  Package,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const MAX_IMAGES = 6;

export default function AddProductImages() {
  const router = useRouter();

  const { product_id } = useParams();

  const [product, setProduct] = useState({});

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [selectedPreviews, setSelectedPreviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await client
          .get("product/admin/" + product_id)
          .then((res) => res.data);

        if (response.success) {
          setProduct(response.data || {});
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load product");
      } finally {
        setLoading(false);
      }
    };

    if (product_id) {
      fetchProduct();
    }
  }, [product_id]);

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedPreviews]);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const existingImages = product?.images?.length || 0;

    const remainingSlots = Math.max(0, MAX_IMAGES - existingImages);

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} product images allowed.`);

      e.target.value = "";

      return;
    }

    const allowedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(
        `You can upload only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}.`,
      );
    }

    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));

    setSelectedFiles(allowedFiles);

    setSelectedPreviews(allowedFiles.map((file) => URL.createObjectURL(file)));

    e.target.value = "";
  };

  const removeSelectedImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

    setSelectedPreviews((prev) => {
      const url = prev[index];

      if (url) {
        URL.revokeObjectURL(url);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = async (imageUrl) => {
    const confirmed = window.confirm("Remove this product image?");

    if (!confirmed) {
      return;
    }

    try {
      await client.delete("product/images/" + product_id, {
        data: {
          url: imageUrl,
        },
      });

      setProduct((prev) => ({
        ...prev,

        images: (prev.images || []).filter((image) => image !== imageUrl),
      }));

      toast.success("Image removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to remove image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    if (!selectedFiles.length) {
      toast.error("Please select at least one image.");

      return;
    }

    setSaving(true);

    const payload = new FormData();

    selectedFiles.forEach((file) => {
      payload.append("images", file);
    });

    try {
      const response = await client.post(
        `product/add_images/${product_id}`,
        payload,
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Product images uploaded successfully",
        );

        router.push("/admin/products");
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

  const uploadedImages = product?.images || [];

  const totalImages = uploadedImages.length + selectedFiles.length;

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2 size={30} className="mx-auto animate-spin text-[#8b5e3c]" />

          <p className="mt-3 text-sm text-[#786454]">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 pb-10">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6a43]">
              Catalog Management
            </p>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
                <Images size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#2b1b11] sm:text-3xl">
                  Product Images
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#786454]">
                  Manage gallery images for this product. Upload clear product
                  photography from multiple angles.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="
                            inline-flex
                            min-h-11
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
                        "
          >
            <ArrowLeft size={17} />
            Back to Products
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e8ded0] bg-[#f3ede5]">
            {product?.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title || "Product"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package size={24} className="text-[#9a6a43]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a6a43]">
              Product
            </p>

            <h2 className="mt-1 truncate text-lg font-semibold text-[#2b1b11]">
              {product?.title || "Product"}
            </h2>

            <p className="mt-1 text-xs text-[#786454]">
              {uploadedImages.length}
              {" / "}
              {MAX_IMAGES} gallery images uploaded
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3ede5] px-3 py-2 text-xs font-semibold text-[#8b5e3c]">
            <Images size={14} />
            {totalImages} / {MAX_IMAGES}
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <div className="flex items-start gap-3 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
              <UploadCloud size={18} />
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#2b1b11] sm:text-[16px]">
                Upload New Images
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
                Select multiple images. Maximum {MAX_IMAGES} gallery images per
                product.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <label
              className={`
                                flex
                                min-h-[220px]
                                flex-col
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-dashed
                                px-6
                                text-center
                                transition

                                ${
                                  uploadedImages.length >= MAX_IMAGES
                                    ? "cursor-not-allowed border-[#ded5cb] bg-[#f3ede5] opacity-70"
                                    : "cursor-pointer border-[#cdb9a5] bg-[#faf8f4] hover:border-[#8b5e3c] hover:bg-[#f7f2ec]"
                                }
                            `}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0ebe3] text-[#8b5e3c]">
                <ImagePlus size={24} />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#2b1b11]">
                {uploadedImages.length >= MAX_IMAGES
                  ? "Maximum images reached"
                  : "Choose product images"}
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-[#8f7a68]">
                {uploadedImages.length >= MAX_IMAGES
                  ? "Remove an existing image before uploading another one."
                  : "Click to browse and select one or more JPG, PNG or WEBP images."}
              </p>

              {uploadedImages.length < MAX_IMAGES && (
                <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#8b5e3c] px-4 py-2.5 text-xs font-semibold text-white">
                  <UploadCloud size={15} />
                  Browse Images
                </span>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                name="images"
                disabled={uploadedImages.length >= MAX_IMAGES}
                onChange={handleImagesChange}
                className="hidden"
              />
            </label>

            {selectedPreviews.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[#2b1b11]">
                      Ready to Upload
                    </h3>

                    <p className="mt-1 text-xs text-[#8f7a68]">
                      {selectedPreviews.length} image
                      {selectedPreviews.length === 1 ? "" : "s"} selected
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 size={13} />
                    Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                  {selectedPreviews.map((previewUrl, index) => (
                    <div
                      key={previewUrl}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[#e8ded0] bg-[#f3ede5]"
                    >
                      <img
                        src={previewUrl}
                        alt={`Selected product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        aria-label={`Remove selected image ${index + 1}`}
                        className="
                                                        absolute
                                                        right-2
                                                        top-2
                                                        flex
                                                        h-8
                                                        w-8
                                                        cursor-pointer
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-white/95
                                                        text-red-600
                                                        shadow-sm
                                                        transition
                                                        hover:bg-red-50
                                                    "
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
                <Images size={18} />
              </div>

              <div>
                <h2 className="text-[15px] font-semibold text-[#2b1b11] sm:text-[16px]">
                  Uploaded Images
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
                  Manage existing product gallery images.
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-[#f3ede5] px-3 py-1.5 text-[11px] font-semibold text-[#8b5e3c]">
              {uploadedImages.length} / {MAX_IMAGES}
            </span>
          </div>

          <div className="p-5 sm:p-6">
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {uploadedImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="
                                                group
                                                overflow-hidden
                                                rounded-2xl
                                                border
                                                border-[#e8ded0]
                                                bg-white
                                                transition
                                                hover:border-[#d4c1af]
                                                hover:shadow-sm
                                            "
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#f3ede5]">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <span className="absolute left-2 top-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                        {index + 1}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className="
                                                        flex
                                                        min-h-9
                                                        w-full
                                                        cursor-pointer
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-lg
                                                        border
                                                        border-red-200
                                                        bg-red-50/40
                                                        px-3
                                                        text-xs
                                                        font-medium
                                                        text-red-600
                                                        transition
                                                        hover:bg-red-50
                                                    "
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8c8b8] bg-[#faf8f4] px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
                  <ImagePlus size={22} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#2b1b11]">
                  No gallery images yet
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#8f7a68]">
                  Select product images above to build the product gallery.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="sticky bottom-4 z-20 rounded-2xl border border-[#e8ded0] bg-[#fffdfa]/95 p-4 shadow-lg backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2b1b11]">
                Product Gallery
              </p>

              <p className="mt-1 text-xs text-[#8f7a68]">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} new image${selectedFiles.length === 1 ? "" : "s"} ready to upload.`
                  : "Select images before saving."}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="
                                    min-h-11
                                    cursor-pointer
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
              </button>

              <button
                type="submit"
                disabled={saving || !selectedFiles.length}
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
                                    disabled:opacity-50
                                "
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={17} />
                    Upload Images
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
