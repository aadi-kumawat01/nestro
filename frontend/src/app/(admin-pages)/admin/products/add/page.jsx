/* eslint-disable @next/next/no-img-element -- Admin previews may use local object URLs. */
"use client";

import React, { useEffect, useState } from "react";
import { generateSlug, client } from "@/utils/helper";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  PackagePlus,
  PencilLine,
  Package,
  Tags,
  IndianRupee,
  Armchair,
  Ruler,
  ImagePlus,
  Settings2,
  Upload,
  Boxes,
  ShieldCheck,
  Wrench,
  Layers3,
} from "lucide-react";

const emptyProduct = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  roomType: "",
  price: "",
  salePrice: "",
  discount: "",
  stock: true,
  stockQuantity: 0,
  sku: "",
  warranty: "",
  assembly: "",
  variantGroup: "",
  material: "Wood",
  color: "",
  length: "",
  width: "",
  height: "",
  weight: "",
  featured: false,
  bestSeller: false,
  newArrival: false,
  status: true,
  thumbnail: null,
};

export default function AddProduct({ productId }) {
  const router = useRouter();

  const isEditing = Boolean(productId);

  const [data, setData] = useState(emptyProduct);

  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState([]);

  const [room, setRooms] = useState([]);

  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    client
      .get("product/admin/" + productId)
      .then(({ data: response }) => {
        const product = response.data;

        setData({
          ...emptyProduct,
          ...product,

          category: product.category?._id || "",

          roomType: product.roomType?._id || "",

          ...product.dimensions,

          weight: product.weight?.value || "",

          thumbnail: null,
        });

        setPreview(product.thumbnail || "");
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load product");
      });
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    const fetchCatalogOptions = async () => {
      setCatalogLoading(true);

      try {
        const [categoryResponse, roomResponse] = await Promise.all([
          client.get("category/admin"),

          client.get("room-type/admin"),
        ]);

        if (!isMounted) return;

        setCategory(
          categoryResponse.data?.success ? categoryResponse.data.data : [],
        );

        setRooms(roomResponse.data?.success ? roomResponse.data.data : []);
      } catch (error) {
        if (!isMounted) return;

        setCategory([]);

        setRooms([]);

        toast.error(
          error.response?.data?.message ||
            "Categories and room types could not be loaded. Please sign in again and retry.",
        );
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
      }
    };

    fetchCatalogOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,

      [name]: value,

      ...(name === "title" &&
        !isEditing && {
          slug: generateSlug(value),
        }),
    }));
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setData((prev) => ({
      ...prev,

      thumbnail: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const toggleSwitch = (field) => {
    setData((prev) => ({
      ...prev,

      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (data.salePrice !== "" && Number(data.salePrice) > Number(data.price)) {
      toast.error("Sale price cannot be greater than the regular price");
      return;
    }

    setSaving(true);

    const payload = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && typeof data[key] !== "object") {
        payload.append(key, data[key]);
      } else if (data[key] instanceof File) {
        payload.append(
          productId && key === "thumbnail" ? "image" : key,

          data[key],
        );
      }
    });

    try {
      const response = productId
        ? await client.put("product/edit/" + productId, payload)
        : await client.post("product/create", payload);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            (isEditing
              ? "Product updated successfully"
              : "Product created successfully"),
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

  const price = Number(data.price);

  const salePrice = Number(data.salePrice);

  const calculatedDiscount =
    price > 0 && salePrice > 0 && salePrice <= price
      ? Math.round(((price - salePrice) / price) * 100)
      : "";

  const salePriceInvalid =
    data.salePrice !== "" && Number(data.salePrice) > Number(data.price);

  const inputClass = `
        h-12
        w-full
        rounded-xl
        border
        border-[#d8c8b8]
        bg-[#fffdfa]
        px-4
        text-sm
        text-[#2b1b11]
        outline-none
        transition
        placeholder:text-[#aa998a]
        focus:border-[#8b5e3c]
        focus:ring-2
        focus:ring-[#8b5e3c]/10
        disabled:cursor-not-allowed
        disabled:bg-[#f3ede5]
        disabled:text-[#9b897b]
    `;

  const textareaClass = `
        w-full
        rounded-xl
        border
        border-[#d8c8b8]
        bg-[#fffdfa]
        px-4
        py-3
        text-sm
        leading-6
        text-[#2b1b11]
        outline-none
        transition
        placeholder:text-[#aa998a]
        focus:border-[#8b5e3c]
        focus:ring-2
        focus:ring-[#8b5e3c]/10
        resize-none
    `;

  return (
    <main className="mx-auto w-full max-w-[1450px] space-y-6 pb-10">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6a43]">
              Catalog Management
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
                {isEditing ? (
                  <PencilLine size={20} />
                ) : (
                  <PackagePlus size={20} />
                )}
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#2b1b11] sm:text-3xl">
                  {isEditing ? "Edit Product" : "Add Product"}
                </h1>

                <p className="mt-1 text-sm text-[#786454]">
                  {isEditing
                    ? "Update product information, pricing and availability."
                    : "Create a new product for your Nestro catalog."}
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
            Back to Products
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          icon={<Boxes size={18} />}
          title="Inventory & Product Identity"
          description="Manage stock levels, SKU and fulfilment information."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <Field label="Stock Quantity">
              <input
                name="stockQuantity"
                type="number"
                min={0}
                value={data.stockQuantity ?? ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
              />
            </Field>

            <Field label="SKU">
              <input
                name="sku"
                type="text"
                value={data.sku ?? ""}
                onChange={handleChange}
                disabled={isEditing}
                className={inputClass}
                placeholder="NEST-SOF-001"
              />

              {isEditing && (
                <p className="mt-2 text-xs text-[#8f7a68]">
                  SKU is kept fixed to preserve inventory and order history.
                </p>
              )}
            </Field>

            <Field label="Warranty" icon={<ShieldCheck size={14} />}>
              <input
                name="warranty"
                type="text"
                value={data.warranty ?? ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="6 months"
              />
            </Field>

            <Field label="Assembly" icon={<Wrench size={14} />}>
              <input
                name="assembly"
                type="text"
                value={data.assembly ?? ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="DIY / Required"
              />
            </Field>

            <Field label="Variant Group" icon={<Layers3 size={14} />}>
              <input
                name="variantGroup"
                type="text"
                value={data.variantGroup ?? ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="Optional"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<Package size={18} />}
          title="Basic Information"
          description="Add the primary product name and customer-facing description."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Product Title">
              <input
                type="text"
                name="title"
                value={data.title}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Luma Queen Platform Bed"
              />
            </Field>

            <Field label="Slug">
              <input
                type="text"
                name="slug"
                value={data.slug}
                onChange={handleChange}
                disabled={isEditing}
                className={inputClass}
                placeholder="luma-queen-platform-bed"
              />

              {isEditing && (
                <p className="mt-2 text-xs text-[#8f7a68]">
                  Slug is kept fixed so existing product links and SEO remain
                  valid.
                </p>
              )}
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Short Description">
              <textarea
                rows={3}
                name="shortDescription"
                value={data.shortDescription}
                onChange={handleChange}
                className={textareaClass}
                placeholder="A short description displayed on the product page."
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Full Description">
              <textarea
                rows={6}
                name="description"
                value={data.description}
                onChange={handleChange}
                className={textareaClass}
                placeholder="Describe materials, finish, comfort, style and other important product details."
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<Tags size={18} />}
          title="Category Information"
          description="Choose where this product should appear in the storefront."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Category">
              <select
                name="category"
                value={data.category}
                onChange={handleChange}
                className={inputClass}
                disabled={catalogLoading}
              >
                <option value="">
                  {catalogLoading ? "Loading categories..." : "Select Category"}
                </option>

                {category.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Room Type">
              <select
                name="roomType"
                value={data.roomType}
                onChange={handleChange}
                className={inputClass}
                disabled={catalogLoading}
              >
                <option value="">
                  {catalogLoading
                    ? "Loading room types..."
                    : "Select Room Type"}
                </option>

                {room.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<IndianRupee size={18} />}
          title="Pricing"
          description="Set regular and sale pricing. Discount is calculated automatically."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <Field label="Regular Price">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8b5e3c]">
                  ₹
                </span>

                <input
                  type="number"
                  name="price"
                  min="0"
                  value={data.price}
                  onChange={handleChange}
                  className={`${inputClass} pl-8`}
                  placeholder="0"
                />
              </div>
            </Field>

            <Field label="Sale Price">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8b5e3c]">
                  ₹
                </span>

                <input
                  type="number"
                  name="salePrice"
                  min="0"
                  value={data.salePrice}
                  onChange={handleChange}
                  aria-invalid={salePriceInvalid}
                  aria-describedby="sale-price-feedback"
                  className={`${inputClass} pl-8 ${salePriceInvalid ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : ""}`}
                  placeholder="0"
                />
              </div>

              <p
                id="sale-price-feedback"
                role={salePriceInvalid ? "alert" : undefined}
                className={`mt-2 text-xs ${salePriceInvalid ? "font-medium text-red-600" : "text-[#8f7a68]"}`}
              >
                {salePriceInvalid
                  ? "Sale price cannot be greater than the regular price."
                  : "Leave blank when the product is not on sale."}
              </p>
            </Field>

            <Field label="Discount">
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={calculatedDiscount}
                  readOnly
                  className={`${inputClass} bg-[#f3ede5] pr-10`}
                  placeholder="0"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8b5e3c]">
                  %
                </span>
              </div>
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<Armchair size={18} />}
          title="Furniture Details"
          description="Specify material, finish, dimensions and weight."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Material">
              <select
                name="material"
                value={data.material}
                onChange={handleChange}
                className={inputClass}
              >
                <option>Wood</option>

                <option>Sheesham</option>

                <option>Engineered Wood</option>

                <option>Metal</option>

                <option>Steel</option>

                <option>Plastic</option>

                <option>Glass</option>

                <option>Marble</option>

                <option>Fabric</option>

                <option>Leather</option>
              </select>
            </Field>

            <Field label="Colour">
              <input
                type="text"
                name="color"
                value={data.color}
                onChange={handleChange}
                placeholder="e.g. Walnut"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
            <DimensionInput
              label="Length"
              name="length"
              value={data.length}
              onChange={handleChange}
              inputClass={inputClass}
            />

            <DimensionInput
              label="Width"
              name="width"
              value={data.width}
              onChange={handleChange}
              inputClass={inputClass}
            />

            <DimensionInput
              label="Height"
              name="height"
              value={data.height}
              onChange={handleChange}
              inputClass={inputClass}
            />

            <Field label="Weight" icon={<Ruler size={14} />}>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  min="0"
                  value={data.weight}
                  onChange={handleChange}
                  className={`${inputClass} pr-12`}
                  placeholder="0"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9b897b]">
                  kg
                </span>
              </div>
            </Field>
          </div>
        </FormSection>

        <FormSection
          icon={<ImagePlus size={18} />}
          title="Product Thumbnail"
          description="Upload the primary image customers will see across the store."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5c4535]">
                Thumbnail Image
              </label>

              <label
                className="
                                    flex
                                    min-h-[180px]
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
                  <Upload size={20} />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#2b1b11]">
                  Choose product image
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
                  Upload JPG, PNG or WEBP product photography.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5c4535]">
                Preview
              </label>

              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#f3ede5]">
                {preview ? (
                  <img
                    src={preview}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="px-6 text-center">
                    <ImagePlus size={28} className="mx-auto text-[#b8a28f]" />

                    <p className="mt-3 text-sm text-[#8f7a68]">
                      No image selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={<Settings2 size={18} />}
          title="Product Settings"
          description="Control storefront visibility and merchandising labels."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <ToggleCard
              title="In Stock"
              description="Allow customers to purchase this product."
              checked={data.stock}
              onChange={() => toggleSwitch("stock")}
            />

            <ToggleCard
              title="Featured Product"
              description="Highlight this product in featured sections."
              checked={data.featured}
              onChange={() => toggleSwitch("featured")}
            />

            <ToggleCard
              title="Best Seller"
              description="Display the best seller label."
              checked={data.bestSeller}
              onChange={() => toggleSwitch("bestSeller")}
            />

            <ToggleCard
              title="New Arrival"
              description="Mark this product as newly added."
              checked={data.newArrival}
              onChange={() => toggleSwitch("newArrival")}
            />

            <ToggleCard
              title="Active Status"
              description="Publish or hide this product from customers."
              checked={data.status}
              onChange={() => toggleSwitch("status")}
            />
          </div>
        </FormSection>

        <section className="sticky bottom-4 z-20 rounded-2xl border border-[#e8ded0] bg-[#fffdfa]/95 p-4 shadow-lg backdrop-blur sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#2b1b11]">
                {isEditing ? "Ready to update?" : "Ready to publish?"}
              </p>

              <p className="mt-1 text-xs text-[#8f7a68]">
                Review the product information before saving.
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
                disabled={saving || salePriceInvalid}
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
                {isEditing ? (
                  <PencilLine size={17} />
                ) : (
                  <PackagePlus size={17} />
                )}

                {saving
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}

function FormSection({ icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
      <div className="flex items-start gap-3 border-b border-[#eee5da] bg-[#faf8f4] px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#8b5e3c]">
          {icon}
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-[#2b1b11] sm:text-[16px]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[#8f7a68]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[#5c4535]">
        {icon}

        {label}
      </label>

      {children}
    </div>
  );
}

function DimensionInput({ label, name, value, onChange, inputClass }) {
  return (
    <Field label={label} icon={<Ruler size={14} />}>
      <div className="relative">
        <input
          type="number"
          name={name}
          min="0"
          value={value}
          onChange={onChange}
          className={`${inputClass} pr-12`}
          placeholder="0"
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9b897b]">
          cm
        </span>
      </div>
    </Field>
  );
}

function ToggleCard({ title, description, checked, onChange }) {
  return (
    <label
      className={`
                flex
                cursor-pointer
                items-start
                justify-between
                gap-4
                rounded-xl
                border
                p-4
                transition

                ${
                  checked
                    ? "border-[#c69a6b] bg-[#f7f2ec]"
                    : "border-[#e2d5c8] bg-white hover:bg-[#faf8f4]"
                }
            `}
    >
      <div>
        <p className="text-sm font-semibold text-[#2b1b11]">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#8f7a68]">{description}</p>
      </div>

      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />

        <div
          className="
                        h-6
                        w-11
                        rounded-full
                        bg-[#d8c8b8]
                        transition
                        peer-checked:bg-[#8b5e3c]
                    "
        />

        <div
          className="
                        absolute
                        left-1
                        top-1
                        h-4
                        w-4
                        rounded-full
                        bg-white
                        shadow-sm
                        transition-transform
                        peer-checked:translate-x-5
                    "
        />
      </div>
    </label>
  );
}
