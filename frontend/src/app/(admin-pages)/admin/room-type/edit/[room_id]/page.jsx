import { serverApi } from "@/api/server";
import { fetchCategoryById, fetchRoomById } from "@/api/api";
import EditForm from "@/components/admin/category/EditFrom";

import React from "react";

export default async function page({ params }) {
  const promise = await params;
  const { success, data, message } = await serverApi(
    "room-type/admin/" + promise.room_id,
  );

  if (success == false) {
    throw new Error("Internal Server Error");
  }

  return (
    <EditForm
      data={data}
      page="/admin/room-type"
      api={`room-type/edit/${data._id}`}
    />
  );
}
