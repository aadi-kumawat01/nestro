import { serverApi } from "@/api/server";
import { fetchCategoryById } from "@/api/api";
import EditForm from "@/components/admin/category/EditFrom";
import React from "react";

export default async function page({ params }) {
  const promise = await params;
  const { success, data, meggage } = await serverApi(
    "category/admin/" + promise.category_id,
  );
  if (success == false) {
    throw new Error("Internal server error");
  }

  return (
    <div>
      <EditForm
        data={data}
        page="/admin/category"
        api={`category/edit/${data._id}`}
      />
    </div>
  );
}
