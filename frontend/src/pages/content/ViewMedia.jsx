import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const ViewMedia = () => {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await axiosInstance.get(`/api/media/viewmedia`);
        setMedia(res.data);
      } catch (err) {
        setError("Error fetching media details");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [id]);


  

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!media) return <div className="text-center mt-10">No media found</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{media.mediaTitle}</h1>
      <img
        src={media.file}
        alt={media.mediaTitle}
        className="w-full max-h-96 object-contain mb-4"
      />
      <p className="mb-2">
        <strong>Description:</strong> {media.description}
      </p>
      <p className="mb-2">
        <strong>Category:</strong> {media.category}
      </p>
      <p className="mb-2">
        <strong>Privacy:</strong> {media.privacy}
      </p>
      <p className="mb-2">
        <strong>Tags:</strong>{" "}
        {Array.isArray(media.tags) ? media.tags.join(", ") : media.tags}
      </p>
      <p className="mb-2">
        <strong>Upload Date:</strong>{" "}
        {new Date(media.uploadDate).toLocaleString()}
      </p>
    </div>
  );
};

export default ViewMedia;
