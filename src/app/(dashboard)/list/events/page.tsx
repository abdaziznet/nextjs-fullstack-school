import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import dayjs from "dayjs";

type EventList = Event & { class: Class };

const columns = [
  {
    header: "Event Name",
    accessor: "info",
  },
  {
    header: "Class",
    accessor: "class",
  },

  {
    header: "Date",
    accessor: "date",
    className: "hidden lg:table-cell",
  },
  {
    header: "Start Time",
    accessor: "startTime",
    className: "hidden lg:table-cell",
  },
  {
    header: "End Time",
    accessor: "endTime",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "actions",
  },
];
const renderRow = (item: EventList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200  even:bg-slate-50 text-sm hover:bg-secondary-purple-light"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.title}</h3>
      </div>
    </td>
    <td>{item.class?.name}</td>
    <td className="hidden md:table-cell">
      {dayjs(item.startTime).format("DD/MM/YYYY")}
    </td>
    <td className="hidden md:table-cell">
      {dayjs(item.startTime).isValid()
        ? dayjs(item.startTime).format("HH:mm")
        : "Invalid Time"}
    </td>
    <td className="hidden md:table-cell">
      {dayjs(item.endTime).isValid()
        ? dayjs(item.endTime).format("HH:mm")
        : "Invalid Time"}
    </td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormModal table="event" type="update" data={item} />
            <FormModal table="event" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);
const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }

    const [data, count] = await prisma.$transaction([
      prisma.event.findMany({
        where: query,
        include: {
          class: true,
        },
        take: PAGE_SIZE,
        skip: PAGE_SIZE * (p - 1),
      }),
      prisma.event.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                <Image src={"/filter.png"} alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                <Image src={"/sort.png"} alt="" width={14} height={14} />
              </button>
              {role === "admin" && <FormModal table="event" type="create" />}
            </div>
          </div>
        </div>
        {/* LIST */}
        <div className="">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
        {/* PAGINATION */}

        <Pagination page={p} count={count} />
      </div>
    );
  }
};

export default EventListPage;
