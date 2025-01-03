"use client";
import { PAGE_SIZE } from "@/lib/settings";
import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();
  const hasPrev = PAGE_SIZE * (page - 1) > 0;
  const hasNext = PAGE_SIZE * (page - 1) + PAGE_SIZE < count;
  const searchParams = useSearchParams();
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };
  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: Math.ceil(count / PAGE_SIZE) }, (_, index) => {
          const pageIndex = index + 1;
          return (
            <button
              key={pageIndex}
              className={`px-2 rounded-sm ${
                page === pageIndex ? "bg-primary-sky" : ""
              }`}
              onClick={() => changePage(pageIndex)}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>
      <button
        disabled={!hasNext}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => changePage(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
