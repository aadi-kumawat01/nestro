/* eslint-disable @next/next/no-img-element -- Admin thumbnails should accept legacy image hosts. */
import Link from "next/link";

import {
  BedDouble,
  Plus,
  DoorOpen,
  CircleCheck,
  CircleOff,
  Pencil,
  ImageIcon,
} from "lucide-react";

import { serverApi } from "@/api/server";
import StatusBadge from "@/components/admin/category/StatusBadge";
import DeleteButton from "@/components/admin/category/DeleteButton";

export default async function Page() {
  const { success, data, message } = await serverApi("room-type/admin");

  if (!success) {
    throw new Error(message || "Unable to load room types");
  }

  const rooms = data || [];

  const activeRooms = rooms.filter((item) => item.status === true).length;

  const hiddenRooms = rooms.length - activeRooms;

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 pb-10">
      <section className="rounded-3xl border border-[#e8ded0] bg-[#fffdfa] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6a43]">
              Catalog Management
            </p>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3ede5] text-[#8b5e3c]">
                <BedDouble size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#2b1b11] sm:text-3xl">
                  Room Types
                </h1>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#786454]">
                  Organise products by room and control where furniture appears
                  across your store.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/admin/room-type/add"
            className="
                            inline-flex
                            min-h-11
                            w-full
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-[#8b5e3c]
                            px-5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#70482e]
                            sm:w-auto
                        "
          >
            <Plus size={18} />
            Add Room Type
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Total Room Types"
          value={rooms.length}
          icon={<DoorOpen size={19} />}
        />

        <Metric
          label="Active"
          value={activeRooms}
          icon={<CircleCheck size={19} />}
          type="success"
        />

        <Metric
          label="Hidden"
          value={hiddenRooms}
          icon={<CircleOff size={19} />}
          type="muted"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e8ded0] bg-[#fffdfa] shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[#e8ded0] bg-[#faf8f4] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#2b1b11]">
              Room Type List
            </h2>

            <p className="mt-1 text-xs text-[#8f7a68]">
              Manage all available room types.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#f3ede5] px-3 py-1.5 text-[11px] font-semibold text-[#8b5e3c]">
            {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
          </span>
        </div>

        <div className="hidden min-[1900px]:block">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left">
              <thead className="bg-[#f7f2ec]">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#786454]">
                  <th className="w-[110px] px-6 py-4">Image</th>

                  <th className="w-[28%] px-4 py-4">Room Type</th>

                  <th className="w-[28%] px-4 py-4">Slug</th>

                  <th className="w-[140px] px-4 py-4">Status</th>

                  <th className="w-[130px] px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((item) => (
                  <tr
                    key={item._id}
                    className="
                                                group
                                                border-t
                                                border-[#eee5da]
                                                transition
                                                first:border-t-0
                                                hover:bg-[#faf8f4]
                                            "
                  >
                    <td className="px-6 py-4">
                      {item.image ? (
                        <div className="h-14 w-14 overflow-hidden rounded-xl border border-[#e8ded0] bg-[#f3ede5]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#e8ded0] bg-[#f3ede5] text-[#9a6a43]">
                          <ImageIcon size={19} />
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="truncate text-[14px] font-semibold text-[#2b1b11]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#8f7a68]">
                        Furniture room
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex max-w-full rounded-lg bg-[#f3ede5] px-3 py-1.5 text-xs font-medium text-[#70482e]">
                        <span className="truncate">{item.slug}</span>
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={item.status}
                        path={`room-type/status-update/${item._id}`}
                      />
                    </td>

                    <td className="w-[130px] px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/room-type/edit/${item._id}`}
                          title="Edit room type"
                          className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            cursor-pointer
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            border
                                                            border-[#d8c8b8]
                                                            bg-white
                                                            text-[#70482e]
                                                            transition
                                                            hover:border-[#8b5e3c]
                                                            hover:bg-[#f3ede5]
                                                        "
                        >
                          <Pencil size={15} />
                        </Link>

                        <div
                          title="Delete room type"
                          className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            overflow-hidden
                                                            rounded-lg
                                                            border
                                                            border-red-200
                                                            bg-red-50/40

                                                            [&_button]:flex
                                                            [&_button]:h-9
                                                            [&_button]:w-9
                                                            [&_button]:cursor-pointer
                                                            [&_button]:items-center
                                                            [&_button]:justify-center
                                                            [&_button]:overflow-hidden
                                                            [&_button]:whitespace-nowrap
                                                            [&_button]:border-0
                                                            [&_button]:bg-transparent
                                                            [&_button]:p-0
                                                            [&_button]:text-[0px]
                                                            [&_button]:text-red-600
                                                            [&_button]:shadow-none
                                                            [&_button]:transition
                                                            [&_button]:hover:bg-red-50

                                                            [&_svg]:h-4
                                                            [&_svg]:w-4
                                                            [&_svg]:shrink-0
                                                            [&_svg]:text-red-600
                                                        "
                        >
                          <DeleteButton path={`room-type/delete/${item._id}`} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 min-[1900px]:hidden">
          {rooms.map((item) => (
            <article
              key={item._id}
              className="
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-[#e8ded0]
                                    bg-white
                                    transition
                                    duration-200
                                    hover:border-[#d4c1af]
                                    hover:shadow-md
                                "
            >
              <div className="flex gap-4 p-4">
                {item.image ? (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8ded0] bg-[#f3ede5]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[#e8ded0] bg-[#f3ede5] text-[#9a6a43]">
                    <BedDouble size={23} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-semibold text-[#2b1b11]">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#8f7a68]">Furniture room</p>

                  <div className="mt-3">
                    <StatusBadge
                      status={item.status}
                      path={`room-type/status-update/${item._id}`}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#eee5da] bg-[#fffdfa] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
                  Slug
                </p>

                <p className="mt-1 truncate text-xs font-medium text-[#70482e]">
                  {item.slug}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[#eee5da] bg-[#fffdfa] p-3">
                <Link
                  href={`/admin/room-type/edit/${item._id}`}
                  className="
                                            flex
                                            min-h-10
                                            cursor-pointer
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-lg
                                            border
                                            border-[#d8c8b8]
                                            bg-white
                                            px-3
                                            text-xs
                                            font-medium
                                            text-[#70482e]
                                            transition
                                            hover:border-[#8b5e3c]
                                            hover:bg-[#f3ede5]
                                        "
                >
                  <Pencil size={14} />
                  Edit
                </Link>

                <div
                  className="
                                            flex
                                            min-h-10
                                            items-center
                                            justify-center
                                            overflow-hidden
                                            rounded-lg
                                            border
                                            border-red-200
                                            bg-red-50/40

                                            [&_button]:flex
                                            [&_button]:min-h-10
                                            [&_button]:w-full
                                            [&_button]:cursor-pointer
                                            [&_button]:items-center
                                            [&_button]:justify-center
                                            [&_button]:gap-2
                                            [&_button]:border-0
                                            [&_button]:bg-transparent
                                            [&_button]:px-3
                                            [&_button]:py-0
                                            [&_button]:text-xs
                                            [&_button]:font-medium
                                            [&_button]:text-red-600
                                            [&_button]:shadow-none
                                            [&_button]:transition
                                            [&_button]:hover:bg-red-50

                                            [&_svg]:h-4
                                            [&_svg]:w-4
                                            [&_svg]:shrink-0
                                        "
                >
                  <DeleteButton path={`room-type/delete/${item._id}`} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {!rooms.length && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3ede5] text-[#8b5e3c]">
              <BedDouble size={24} />
            </div>

            <h3 className="mt-4 text-[16px] font-semibold text-[#2b1b11]">
              No room types yet
            </h3>

            <p className="mt-2 text-sm text-[#786454]">
              Add your first room type to organise products by living space.
            </p>

            <Link
              href="/admin/room-type/add"
              className="
                                mt-5
                                inline-flex
                                min-h-10
                                cursor-pointer
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#8b5e3c]
                                px-5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#70482e]
                            "
            >
              <Plus size={16} />
              Add Room Type
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, icon, type = "default" }) {
  const iconStyle = {
    default: "bg-[#f3ede5] text-[#8b5e3c]",

    success: "bg-emerald-50 text-emerald-700",

    muted: "bg-[#f3ede5] text-[#786454]",
  };

  return (
    <div className="rounded-2xl border border-[#e8ded0] bg-[#fffdfa] p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${iconStyle[type]}
                    `}
        >
          {icon}
        </div>

        <span className="text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b897b]">
          {label}
        </span>
      </div>

      <strong className="mt-4 block text-2xl font-semibold text-[#2b1b11] sm:text-3xl">
        {value}
      </strong>
    </div>
  );
}
