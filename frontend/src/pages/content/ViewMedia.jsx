import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { FaThumbsUp, FaComment, FaShare, FaBookmark } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
// Import all thumbnails
import y1 from "../../assets/thumbnail/y1.png";
import y2 from "../../assets/thumbnail/y2.png";
import y3 from "../../assets/thumbnail/y3.png";
import y4 from "../../assets/thumbnail/y4.png";
import y5 from "../../assets/thumbnail/y5.png";
import y7 from "../../assets/thumbnail/y7.png";
import y8 from "../../assets/thumbnail/y8.png";
import y10 from "../../assets/thumbnail/y10.png";
import y11 from "../../assets/thumbnail/y11.png";
import y12 from "../../assets/thumbnail/y12.png";
import y13 from "../../assets/thumbnail/y13.png";
import y14 from "../../assets/thumbnail/y14.png";
import y15 from "../../assets/thumbnail/y15.png";
import y16 from "../../assets/thumbnail/y16.png";

const ViewMedia = () => {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Map of all available thumbnails
  const thumbnails = {
    y1, y2, y3, y4, y5, y7, y8, y10, y11, y12, y13, y14, y15, y16
  };

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axiosInstance.get(`/api/media/view/${id}`);
        setMedia(response.data);
        setLikes(response.data.likes?.length || 0);
        setComments(response.data.comments || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load media.");
        setLoading(false);
      }
    };
    fetchMedia();
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await axiosInstance.post(`/api/media/like/${id}`);
      setLikes(response.data.likes);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Failed to like media:", err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axiosInstance.post(`/api/media/comment/${id}`, {
        content: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: media.mediaTitle,
        text: media.description,
        url: window.location.href,
      });
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axiosInstance.post(`/api/media/save/${id}`);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Failed to save media:", err);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!media) return <div className="text-center mt-10">Media not found</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Media Player/Viewer */}
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          {media.mediaType === "video" ? (
            <video
              controls
              className="w-full aspect-video"
              src={media.file}
              poster={media.thumbnail ? thumbnails[media.thumbnail] : thumbnails.y1}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={media.file}
              alt={media.mediaTitle}
              className="w-full aspect-video object-contain"
            />
          )}
        </div>

        {/* Media Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{media.mediaTitle}</h1>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {formatDistanceToNow(new Date(media.uploadDate), { addSuffix: true })}
              </span>
              <span className="text-gray-600">{media.category}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isLiked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                <FaThumbsUp />
                <span>{likes}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600"
              >
                <FaShare />
                <span>Share</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  isSaved ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                <FaBookmark />
                <span>Save</span>
              </button>
            </div>
          </div>
          <p className="text-gray-700 mb-4">{media.description}</p>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Comment
              </button>
            </div>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="border-b pb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{comment.user?.name || "Anonymous"}</span>
                      <span className="text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMedia;
