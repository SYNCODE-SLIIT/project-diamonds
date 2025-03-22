import { useState } from "react";

const ContentMediaDashboard = () => {
  const [content] = useState([
    { id: 1, type: "image", name: "Banner.png" },
    { id: 2, type: "video", name: "Promo.mp4" },
    { id: 3, type: "document", name: "Article.docx" },
  ]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Content & Media Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.map((item) => (
          <div key={item.id} className="p-4 bg-white shadow-md rounded-lg flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {item.type === "image" && "🖼️"}
                {item.type === "video" && "🎥"}
                {item.type === "document" && "📄"}
              </span>
              <span className="font-medium text-gray-700">{item.name}</span>
            </div>
            <button className="px-3 py-1 bg-gray-200 text-sm rounded-lg">Manage</button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
          ➕ Add New Content
        </button>
      </div>
    </div>
  );
};

export default ContentMediaDashboard;
