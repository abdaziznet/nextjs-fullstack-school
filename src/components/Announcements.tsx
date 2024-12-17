import { announcementsData } from "@/lib/data";

const Announcements = () => {
  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcementsData.slice(0, 4).map((announcement) => (
          <div className="odd:bg-secondary-purple-light even:bg-primary-sky-light rounded-md p-4">
            <div
              className="flex items-center justify-between "
              key={announcement.id}
            >
              <h2 className="font-medium text-gray-600">
                {announcement.title}
              </h2>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {announcement.date}
              </span>
            </div>
            <p className="text-gray-400 mt-1 text-sm">
              Class {announcement.class}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
