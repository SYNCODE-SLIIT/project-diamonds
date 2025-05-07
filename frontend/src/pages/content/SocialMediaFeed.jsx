import React, { useState, useEffect } from 'react';
import { FaYoutube, FaTiktok, FaFacebook, FaInstagram } from 'react-icons/fa';

const SocialMediaFeed = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 'youtube', name: 'YouTube', connected: true },
    { id: 'tiktok', name: 'TikTok', connected: true },
    { id: 'facebook', name: 'Facebook', connected: true },
    { id: 'instagram', name: 'Instagram', connected: true }
  ]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);

  const socialPlatforms = [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: <FaYoutube className="text-red-600" />,
      channelUrl: 'https://www.youtube.com/@Teamdiamondsmanagement',
      description: 'Team Diamond Management YouTube Channel'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: <FaTiktok className="text-black" />,
      channelUrl: 'https://www.tiktok.com/@teamdiamonds',
      description: 'Team Diamond TikTok Channel'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FaFacebook className="text-blue-600" />,
      channelUrl: 'https://www.facebook.com/share/1CAjYWiVkG/',
      description: 'Team Diamond Facebook Page'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <FaInstagram className="text-pink-600" />,
      channelUrl: 'https://www.instagram.com/teamdiamonds',
      description: 'Team Diamond Instagram Profile'
    }
  ];

  useEffect(() => {
    // Simulated YouTube video data
    setYoutubeVideos([
      {
        id: 1,
        title: "Team Diamond Performance Highlights",
        thumbnail: "https://i.ytimg.com/vi/your-video-id/maxresdefault.jpg",
        views: "1.2K views",
        date: "2 weeks ago"
      },
      {
        id: 2,
        title: "Behind the Scenes - Team Diamond",
        thumbnail: "https://i.ytimg.com/vi/your-video-id/maxresdefault.jpg",
        views: "800 views",
        date: "1 month ago"
      }
    ]);

    // Simulated TikTok video data
    setTiktokVideos([
      {
        id: 1,
        title: "Team Diamond Dance Practice",
        thumbnail: "https://example.com/tiktok-thumbnail.jpg",
        likes: "2.5K",
        date: "3 days ago"
      },
      {
        id: 2,
        title: "Performance Highlights",
        thumbnail: "https://example.com/tiktok-thumbnail.jpg",
        likes: "1.8K",
        date: "1 week ago"
      }
    ]);

    // Simulated Facebook posts
    setFacebookPosts([
      {
        id: 1,
        content: "Exciting news! Team Diamond will be performing at the upcoming dance competition! 🎉",
        image: "https://example.com/facebook-post1.jpg",
        likes: "150",
        comments: "23",
        date: "1 day ago"
      },
      {
        id: 2,
        content: "Behind the scenes of our latest performance. The team worked so hard! 💪",
        image: "https://example.com/facebook-post2.jpg",
        likes: "200",
        comments: "45",
        date: "3 days ago"
      }
    ]);

    // Simulated Instagram posts
    setInstagramPosts([
      {
        id: 1,
        image: "https://example.com/instagram-post1.jpg",
        caption: "Team practice session 💃 #TeamDiamond #DanceLife",
        likes: "500",
        comments: "50",
        date: "2 days ago"
      },
      {
        id: 2,
        image: "https://example.com/instagram-post2.jpg",
        caption: "Performance highlights ✨ #Dance #TeamDiamond",
        likes: "750",
        comments: "85",
        date: "5 days ago"
      }
    ]);
  }, []);

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    // Here you would typically open an OAuth flow or API connection dialog
  };

  const handleDisconnect = (platformId) => {
    setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== platformId));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Social Media Feed Integration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialPlatforms.map((platform) => (
          <div key={platform.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{platform.icon}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">{platform.name}</h2>
                  <p className="text-sm text-gray-500">{platform.description}</p>
                </div>
              </div>
              {connectedAccounts.some(acc => acc.id === platform.id) ? (
                <button
                  onClick={() => handleDisconnect(platform.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(platform)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Connect
                </button>
              )}
            </div>
            
            {connectedAccounts.some(acc => acc.id === platform.id) && (
              <div className="mt-4">
                <a 
                  href={platform.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Visit Channel →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* YouTube Feed Preview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">YouTube Feed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youtubeVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative pb-[56.25%]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{video.views}</span>
                  <span>{video.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TikTok Feed Preview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">TikTok Feed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiktokVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative pb-[177.77%]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>❤️ {video.likes}</span>
                  <span>{video.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook Feed Preview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Facebook Feed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facebookPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <div className="relative pb-[56.25%] mb-4">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>👍 {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Feed Preview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Instagram Feed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instagramPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative pb-[100%]">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-gray-800 mb-2">{post.caption}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaFeed; 