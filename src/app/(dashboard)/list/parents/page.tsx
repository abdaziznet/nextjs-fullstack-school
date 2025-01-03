import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { parentsData, role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type ParentList = Parent & { students: Student[] };

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Name",
    accessor: "students",
    className: "hidden lg:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "actions",
  },
];
const renderRow = (item: ParentList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200  even:bg-slate-50 text-sm hover:bg-secondary-purple-light"
  >
    <td className="flex items-center gap-4 p-4">
      {/* <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        /> */}
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="font-xs text-gray-500">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.students.map((student) => student.name).join(", ")}
    </td>
    <td className="hidden md:table-cell">{item.phone}</td>
    <td className="hidden md:table-cell">{item.address}</td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormModal table="parent" type="update" data={item} />
            <FormModal table="parent" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);
const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;

          default:
            break;
        }
      }
    }

    const [data, count] = await prisma.$transaction([
      prisma.parent.findMany({
        where: query,
        include: {
          students: true,
        },
        take: PAGE_SIZE,
        skip: PAGE_SIZE * (p - 1),
      }),
      prisma.parent.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                <Image src={"/filter.png"} alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                <Image src={"/sort.png"} alt="" width={14} height={14} />
              </button>
              {role === "admin" && <FormModal table="parent" type="create" />}
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

export default ParentListPage;
