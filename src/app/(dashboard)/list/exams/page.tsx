import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import dayjs from "dayjs";
import Image from "next/image";

type ExamList = Exam & {
  lesson: {
    Subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Exam Name",
      accessor: "info",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden lg:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];
  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200  even:bg-slate-50 text-sm hover:bg-secondary-purple-light"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.lesson.Subject.name}</h3>
        </div>
      </td>
      <td>{item.lesson.class.name}</td>
      <td className="hidden md:table-cell">
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {dayjs(item.startTime).format("DD/MM/YYYY")}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ExamWhereInput = {};
  query.lesson = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = parseInt(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.lesson.Subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          default:
            break;
        }
      }
    }

    // ROLE CONDITIONS
    switch (role) {
      case "admin":
        break;
      case "teacher":
        query.lesson.teacherId = currentUserId!;
        break;
      case "student":
        query.lesson.class = {
          students: {
            some: {
              id: currentUserId!,
            },
          },
        };
        break;
      case "parent":
        query.lesson.class = {
          students: {
            some: {
              parentId: currentUserId!,
            },
          },
        };
        break;

      default:
        break;
    }

    const [data, count] = await prisma.$transaction([
      prisma.exam.findMany({
        where: query,
        include: {
          lesson: {
            select: {
              Subject: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              class: { select: { name: true } },
            },
          },
        },
        take: PAGE_SIZE,
        skip: PAGE_SIZE * (p - 1),
      }),
      prisma.exam.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                <Image src={"/filter.png"} alt="" width={14} height={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                <Image src={"/sort.png"} alt="" width={14} height={14} />
              </button>
              {role === "admin" && (
                // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-third-yellow">
                //   <Image src={"/plus.png"} alt="" width={14} height={14} />
                // </button>
                <FormContainer table="exam" type="create" />
              )}
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

export default ExamListPage;
