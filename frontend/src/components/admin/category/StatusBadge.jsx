"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { client } from "@/utils/helper";
import Swal from "sweetalert2";

export default function StatusBadge({ status, path }) {
  const router = useRouter();
  const active = status === true;

  async function statusHandler() {
    Swal.fire({
      title: active ? "Hide this product?" : "Publish this product?",
      text: active
        ? "Customers will no longer see it in the storefront."
        : "The product will become visible if its required catalog data is complete.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: active ? "Hide product" : "Publish product",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: active ? "Hidden" : "Published",
          text: active
            ? "The product is now hidden."
            : "The product is now visible.",
          icon: "success",
        });
        try {
          const response = await client.patch(path);
          if (response.data.success) {
            toast.success(response.data.message);
            router.refresh();
          }
        } catch (error) {
          toast.error(error.response.data.message || "Internal server error");
        }
      }
    });
  }

  return (
    <button
      onClick={statusHandler}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        active
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
