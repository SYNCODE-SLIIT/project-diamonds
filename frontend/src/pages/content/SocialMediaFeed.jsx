import React, { useState, useEffect } from 'react';
import { FaYoutube, FaTiktok, FaFacebook, FaInstagram, FaChartLine, FaHeart, FaComment, FaShare, FaCalendarAlt, FaFilter, FaClock, FaChartBar, FaBullhorn, FaHashtag, FaLink, FaCalendar, FaRobot, FaUsers, FaChartPie, FaLightbulb, FaUserFriends, FaTrophy, FaRegCalendarAlt, FaPlay, FaBell, FaEllipsisH, FaMusic, FaBookmark, FaHome, FaSearch, FaCog } from 'react-icons/fa';
import { formatDistanceToNow, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

const SocialMediaFeed = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 'youtube', name: 'YouTube', connected: true },
    { id: 'tiktok', name: 'TikTok', connected: true },
    { id: 'facebook', name: 'Facebook', connected: true },
    { id: 'instagram', name: 'Instagram', connected: true }
  ]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalEngagement: 0,
    platformStats: {},
    trendingContent: [],
    bestPostingTimes: {},
    hashtagPerformance: {}
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [crossPostContent, setCrossPostContent] = useState({
    content: '',
    platforms: [],
    scheduledTime: null
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCompetitorAnalysis, setShowCompetitorAnalysis] = useState(false);
  const [showAudienceInsights, setShowAudienceInsights] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [contentSuggestions, setContentSuggestions] = useState([]);
  const [competitorData, setCompetitorData] = useState({});
  const [audienceData, setAudienceData] = useState({});
  const [performancePredictions, setPerformancePredictions] = useState({});
  const [activeNavItem, setActiveNavItem] = useState('home');

  const socialPlatforms = [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: <FaYoutube className="text-red-600" />,
      channelUrl: 'https://www.youtube.com/@Teamdiamondsmanagement',
      description: 'Team Diamond Management YouTube Channel',
      color: 'bg-red-50'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: <FaTiktok className="text-black" />,
      channelUrl: 'https://www.tiktok.com/@teamdiamonds',
      description: 'Team Diamond TikTok Channel',
      color: 'bg-gray-50'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FaFacebook className="text-blue-600" />,
      channelUrl: 'https://www.facebook.com/share/1CAjYWiVkG/',
      description: 'Team Diamond Facebook Page',
      color: 'bg-blue-50'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <FaInstagram className="text-pink-600" />,
      channelUrl: 'https://www.instagram.com/teamdiamonds',
      description: 'Team Diamond Instagram Profile',
      color: 'bg-pink-50'
    }
  ];

  const navItems = [
    { id: 'home', label: 'Home', icon: <FaHome />, color: 'from-blue-500 to-blue-600' },
    { id: 'analytics', label: 'Analytics', icon: <FaChartLine />, color: 'from-purple-500 to-purple-600' },
    { id: 'calendar', label: 'Calendar', icon: <FaCalendar />, color: 'from-green-500 to-green-600' },
    { id: 'suggestions', label: 'Suggestions', icon: <FaRobot />, color: 'from-yellow-500 to-yellow-600' },
    { id: 'competitors', label: 'Competitors', icon: <FaTrophy />, color: 'from-red-500 to-red-600' },
    { id: 'audience', label: 'Audience', icon: <FaUsers />, color: 'from-indigo-500 to-indigo-600' },
    { id: 'predictions', label: 'Predictions', icon: <FaChartPie />, color: 'from-pink-500 to-pink-600' },
    { id: 'hashtags', label: 'Hashtags', icon: <FaHashtag />, color: 'from-teal-500 to-teal-600' }
  ];

  useEffect(() => {
    // Simulated data loading
    loadSocialMediaData();
    loadAnalytics();
  }, []);

  const loadSocialMediaData = () => {
    // Simulated YouTube video data
    setYoutubeVideos([
      {
        id: 1,
        title: "Team Diamond Performance Highlights",
        thumbnail: "https://i.ytimg.com/vi/your-video-id/maxresdefault.jpg",
        views: "1.2K views",
        likes: "450",
        comments: "23",
        date: "2 weeks ago",
        engagement: 1473
      },
      {
        id: 2,
        title: "Behind the Scenes - Team Diamond",
        thumbnail: "https://i.ytimg.com/vi/your-video-id/maxresdefault.jpg",
        views: "800 views",
        likes: "320",
        comments: "15",
        date: "1 month ago",
        engagement: 1135
      }
    ]);

    // Simulated TikTok video data
    setTiktokVideos([
      {
        id: 1,
        title: "Team Diamond Dance Practice",
        thumbnail: "https://example.com/tiktok-thumbnail.jpg",
        likes: "2.5K",
        comments: "180",
        shares: "45",
        date: "3 days ago",
        engagement: 2725
      },
      {
        id: 2,
        title: "Performance Highlights",
        thumbnail: "https://example.com/tiktok-thumbnail.jpg",
        likes: "1.8K",
        comments: "120",
        shares: "30",
        date: "1 week ago",
        engagement: 1950
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
        shares: "12",
        date: "1 day ago",
        engagement: 185
      },
      {
        id: 2,
        content: "Behind the scenes of our latest performance. The team worked so hard! 💪",
        image: "https://example.com/facebook-post2.jpg",
        likes: "200",
        comments: "45",
        shares: "18",
        date: "3 days ago",
        engagement: 263
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
        date: "2 days ago",
        engagement: 550
      },
      {
        id: 2,
        image: "https://example.com/instagram-post2.jpg",
        caption: "Performance highlights ✨ #Dance #TeamDiamond",
        likes: "750",
        comments: "85",
        date: "5 days ago",
        engagement: 835
      }
    ]);
  };

  const loadAnalytics = () => {
    setAnalytics({
      totalEngagement: 8251,
      platformStats: {
        youtube: { followers: 1200, engagement: 2608, growth: '+12%' },
        tiktok: { followers: 3500, engagement: 4675, growth: '+25%' },
        facebook: { followers: 800, engagement: 448, growth: '+8%' },
        instagram: { followers: 2500, engagement: 1385, growth: '+18%' }
      },
      trendingContent: [
        { platform: 'tiktok', title: 'Team Diamond Dance Practice', engagement: 2725 },
        { platform: 'instagram', title: 'Performance highlights', engagement: 835 },
        { platform: 'youtube', title: 'Team Diamond Performance Highlights', engagement: 1473 }
      ],
      bestPostingTimes: {
        youtube: ['15:00', '18:00', '20:00'],
        tiktok: ['12:00', '17:00', '21:00'],
        facebook: ['09:00', '15:00', '19:00'],
        instagram: ['11:00', '14:00', '20:00']
      },
      hashtagPerformance: {
        '#TeamDiamond': 2500,
        '#DanceLife': 1800,
        '#Performance': 1200,
        '#Dance': 950
      }
    });
  };

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
  };

  const handleDisconnect = (platformId) => {
    setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== platformId));
  };

  const handleSchedulePost = (post) => {
    setSelectedPost(post);
    setShowScheduleModal(true);
  };

  const handleCrossPost = (content) => {
    setCrossPostContent({
      content,
      platforms: [],
      scheduledTime: null
    });
    setShowScheduleModal(true);
  };

  const handleHashtagAnalysis = () => {
    setHashtagSuggestions([
      { tag: '#TeamDiamond', score: 95 },
      { tag: '#DanceLife', score: 88 },
      { tag: '#Performance', score: 85 },
      { tag: '#Dance', score: 82 },
      { tag: '#DanceTeam', score: 80 }
    ]);
    setShowHashtagModal(true);
  };

  const loadContentSuggestions = () => {
    setContentSuggestions([
      {
        type: 'video',
        title: 'Behind the Scenes - Dance Practice',
        platforms: ['youtube', 'tiktok'],
        predictedEngagement: 2500,
        bestTime: '15:00',
        tags: ['#DanceLife', '#TeamDiamond']
      },
      {
        type: 'photo',
        title: 'Team Performance Highlights',
        platforms: ['instagram', 'facebook'],
        predictedEngagement: 1800,
        bestTime: '14:00',
        tags: ['#Performance', '#Dance']
      },
      {
        type: 'story',
        title: 'Day in the Life of Team Diamond',
        platforms: ['instagram', 'tiktok'],
        predictedEngagement: 1200,
        bestTime: '12:00',
        tags: ['#BehindTheScenes', '#TeamDiamond']
      }
    ]);
  };

  const loadCompetitorData = () => {
    setCompetitorData({
      topCompetitors: [
        { name: 'Dance Elite', followers: 50000, engagement: 8.5, growth: '+15%' },
        { name: 'Rhythm Masters', followers: 35000, engagement: 7.2, growth: '+12%' },
        { name: 'Groove Squad', followers: 28000, engagement: 6.8, growth: '+10%' }
      ],
      contentComparison: {
        videoFrequency: { you: 3, competitors: 4 },
        engagementRate: { you: 7.5, competitors: 6.2 },
        hashtagUsage: { you: 5, competitors: 4 }
      },
      audienceOverlap: {
        'Dance Elite': 35,
        'Rhythm Masters': 28,
        'Groove Squad': 22
      }
    });
  };

  const loadAudienceData = () => {
    setAudienceData({
      demographics: {
        ageGroups: {
          '13-17': 25,
          '18-24': 45,
          '25-34': 20,
          '35+': 10
        },
        gender: {
          male: 40,
          female: 60
        },
        locations: {
          'New York': 30,
          'Los Angeles': 25,
          'Chicago': 15,
          'Other': 30
        }
      },
      interests: [
        { name: 'Dance', percentage: 85 },
        { name: 'Music', percentage: 75 },
        { name: 'Fashion', percentage: 60 },
        { name: 'Fitness', percentage: 55 }
      ],
      activeHours: {
        '9:00': 25,
        '12:00': 45,
        '15:00': 65,
        '18:00': 80,
        '21:00': 55
      }
    });
  };

  const loadPerformancePredictions = () => {
    setPerformancePredictions({
      nextWeek: {
        predictedEngagement: 12000,
        bestContentType: 'video',
        bestPlatform: 'tiktok',
        bestTime: '15:00',
        suggestedHashtags: ['#DanceLife', '#TeamDiamond', '#Performance']
      },
      nextMonth: {
        predictedGrowth: '+25%',
        predictedFollowers: 5000,
        contentStrategy: {
          videos: 8,
          photos: 12,
          stories: 20
        }
      }
    });
  };

  const handleNavClick = (itemId) => {
    setActiveNavItem(itemId);
    // Hide all modals when switching navigation
    setShowAnalytics(false);
    setShowCalendar(false);
    setShowSuggestions(false);
    setShowCompetitorAnalysis(false);
    setShowAudienceInsights(false);
    setShowPredictions(false);
    setShowHashtagModal(false);

    switch (itemId) {
      case 'analytics':
        setShowAnalytics(true);
        break;
      case 'calendar':
        setShowCalendar(true);
        break;
      case 'suggestions':
        loadContentSuggestions();
        setShowSuggestions(true);
        break;
      case 'competitors':
        loadCompetitorData();
        setShowCompetitorAnalysis(true);
        break;
      case 'audience':
        loadAudienceData();
        setShowAudienceInsights(true);
        break;
      case 'predictions':
        loadPerformancePredictions();
        setShowPredictions(true);
        break;
      case 'hashtags':
        handleHashtagAnalysis();
        break;
      default:
        break;
    }
  };

  const renderSocialMediaFeeds = () => (
    <div className="space-y-12">
      {/* Platform Selection */}
      <div className="flex space-x-4 mb-6">
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring"
        >
          <option value="all">All Platforms</option>
          {socialPlatforms.map(platform => (
            <option key={platform.id} value={platform.id}>{platform.name}</option>
          ))}
        </select>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="p-2 border rounded-lg focus:outline-none focus:ring"
        >
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Platform Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialPlatforms.map((platform) => (
          <div key={platform.id} className={`bg-white rounded-lg shadow-md p-6 ${platform.color}`}>
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
      {(selectedPlatform === 'all' || selectedPlatform === 'youtube') && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">YouTube Feed</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700">
                <FaYoutube className="inline mr-1" /> Subscribe
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                <FaBell className="inline mr-1" /> Notifications
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {youtubeVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <FaPlay className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{video.views}</span>
                    <span>{video.date}</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaHeart className="mr-1" /> {video.likes}
                    </span>
                    <span className="flex items-center">
                      <FaComment className="mr-1" /> {video.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TikTok Feed Preview */}
      {(selectedPlatform === 'all' || selectedPlatform === 'tiktok') && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">TikTok Feed</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-black text-white rounded-full text-sm hover:bg-gray-800">
                <FaTiktok className="inline mr-1" /> Follow
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                <FaMusic className="inline mr-1" /> Trending
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiktokVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative aspect-[9/16]">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <FaPlay className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{video.date}</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaHeart className="mr-1" /> {video.likes}
                    </span>
                    <span className="flex items-center">
                      <FaComment className="mr-1" /> {video.comments}
                    </span>
                    <span className="flex items-center">
                      <FaShare className="mr-1" /> {video.shares}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facebook Feed Preview */}
      {(selectedPlatform === 'all' || selectedPlatform === 'facebook') && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Facebook Feed</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
                <FaFacebook className="inline mr-1" /> Like Page
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                <FaBell className="inline mr-1" /> Follow
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {facebookPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaFacebook className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Team Diamond</h3>
                      <p className="text-sm text-gray-600">{post.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Post" className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <button className="flex items-center hover:text-blue-600">
                      <FaHeart className="mr-1" /> {post.likes}
                    </button>
                    <button className="flex items-center hover:text-blue-600">
                      <FaComment className="mr-1" /> {post.comments}
                    </button>
                    <button className="flex items-center hover:text-blue-600">
                      <FaShare className="mr-1" /> {post.shares}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instagram Feed Preview */}
      {(selectedPlatform === 'all' || selectedPlatform === 'instagram') && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Instagram Feed</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full text-sm hover:opacity-90">
                <FaInstagram className="inline mr-1" /> Follow
              </button>
              <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">
                <FaHashtag className="inline mr-1" /> Explore
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instagramPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img src={post.image} alt="Post" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center space-x-4">
                    <button className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaHeart className="text-2xl" />
                    </button>
                    <button className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaComment className="text-2xl" />
                    </button>
                    <button className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaShare className="text-2xl" />
                    </button>
                    <button className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FaBookmark className="text-2xl" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                        <FaInstagram className="text-pink-600" />
                      </div>
                      <span className="font-semibold text-gray-800">teamdiamonds</span>
                    </div>
                    <button className="text-gray-600 hover:text-gray-800">
                      <FaEllipsisH />
                    </button>
                  </div>
                  <p className="text-gray-700 mb-2">{post.caption}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaHeart className="mr-1" /> {post.likes}
                    </span>
                    <span className="flex items-center">
                      <FaComment className="mr-1" /> {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Schedule Post</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Platforms</label>
            <div className="mt-2 space-y-2">
              {socialPlatforms.map(platform => (
                <label key={platform.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600"
                    checked={crossPostContent.platforms.includes(platform.id)}
                    onChange={(e) => {
                      const platforms = e.target.checked
                        ? [...crossPostContent.platforms, platform.id]
                        : crossPostContent.platforms.filter(p => p !== platform.id);
                      setCrossPostContent({ ...crossPostContent, platforms });
                    }}
                  />
                  <span className="ml-2">{platform.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              onChange={(e) => setCrossPostContent({ ...crossPostContent, scheduledTime: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle scheduling logic here
                setShowScheduleModal(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHashtagModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Hashtag Analysis</h3>
        <div className="space-y-4">
          {hashtagSuggestions.map((hashtag, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{hashtag.tag}</span>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Score: {hashtag.score}</span>
                <button
                  onClick={() => {
                    // Copy hashtag to clipboard
                    navigator.clipboard.writeText(hashtag.tag);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaLink />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowHashtagModal(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
        <button
          onClick={() => setShowAnalytics(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(analytics.platformStats).map(([platform, stats]) => (
          <div key={platform} className={`p-4 rounded-lg ${socialPlatforms.find(p => p.id === platform)?.color}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold capitalize">{platform}</span>
              {socialPlatforms.find(p => p.id === platform)?.icon}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Followers: {stats.followers.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Engagement: {stats.engagement.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Trending Content</h3>
        <div className="space-y-4">
          {analytics.trendingContent.map((content, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                {socialPlatforms.find(p => p.id === content.platform)?.icon}
                <span className="font-medium">{content.title}</span>
              </div>
              <span className="text-sm text-gray-600">{content.engagement.toLocaleString()} engagements</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Best Posting Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.bestPostingTimes).map(([platform, times]) => (
            <div key={platform} className={`p-4 rounded-lg ${socialPlatforms.find(p => p.id === platform)?.color}`}>
              <div className="flex items-center space-x-2 mb-2">
                {socialPlatforms.find(p => p.id === platform)?.icon}
                <span className="font-medium capitalize">{platform}</span>
              </div>
              <div className="space-y-1">
                {times.map((time, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-2" />
                    {time}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Hashtag Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.hashtagPerformance).map(([hashtag, count]) => (
            <div key={hashtag} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaHashtag className="text-blue-600" />
                <span className="font-medium">{hashtag}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{count.toLocaleString()} uses</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentCalendar = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Content Calendar</h3>
          <button
            onClick={() => setShowCalendar(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {eachDayOfInterval({
            start: startOfMonth(selectedDate),
            end: endOfMonth(selectedDate)
          }).map(day => (
            <div
              key={day.toString()}
              className={`p-2 border rounded-lg ${
                isSameMonth(day, selectedDate)
                  ? 'bg-white'
                  : 'bg-gray-100'
              } ${isToday(day) ? 'border-blue-500' : ''}`}
            >
              <div className="text-sm font-medium">{format(day, 'd')}</div>
              <div className="mt-1 space-y-1">
                {scheduledPosts
                  .filter(post => format(new Date(post.scheduledTime), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                  .map(post => (
                    <div
                      key={post.id}
                      className="text-xs p-1 bg-blue-100 rounded truncate"
                    >
                      {post.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentSuggestions = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Content Suggestions</h3>
          <button
            onClick={() => setShowSuggestions(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="space-y-4">
          {contentSuggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600">Type: {suggestion.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Predicted Engagement: {suggestion.predictedEngagement}</p>
                  <p className="text-sm text-gray-600">Best Time: {suggestion.bestTime}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestion.platforms.map(platform => (
                  <span key={platform} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {platform}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestion.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompetitorAnalysis = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Competitor Analysis</h3>
          <button
            onClick={() => setShowCompetitorAnalysis(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Top Competitors</h4>
            <div className="space-y-4">
              {competitorData.topCompetitors?.map((competitor, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{competitor.name}</span>
                    <span className="text-green-600">{competitor.growth}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Followers:</span>
                      <span className="ml-2">{competitor.followers.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Engagement:</span>
                      <span className="ml-2">{competitor.engagement}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Content Comparison</h4>
            <div className="space-y-4">
              {Object.entries(competitorData.contentComparison || {}).map(([metric, data]) => (
                <div key={metric} className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">{metric.replace(/([A-Z])/g, ' $1').trim()}</h5>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">You</p>
                      <p className="font-semibold">{data.you}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Competitors</p>
                      <p className="font-semibold">{data.competitors}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudienceInsights = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Audience Insights</h3>
          <button
            onClick={() => setShowAudienceInsights(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-4">Demographics</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Age Groups</h5>
                {Object.entries(audienceData.demographics?.ageGroups || {}).map(([age, percentage]) => (
                  <div key={age} className="flex justify-between items-center mb-2">
                    <span className="text-sm">{age}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Gender Distribution</h5>
                {Object.entries(audienceData.demographics?.gender || {}).map(([gender, percentage]) => (
                  <div key={gender} className="flex justify-between items-center mb-2">
                    <span className="text-sm capitalize">{gender}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Interests & Activity</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Top Interests</h5>
                {audienceData.interests?.map((interest, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm">{interest.name}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${interest.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{interest.percentage}%</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Active Hours</h5>
                {Object.entries(audienceData.activeHours || {}).map(([hour, activity]) => (
                  <div key={hour} className="flex justify-between items-center mb-2">
                    <span className="text-sm">{hour}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${activity}%` }}
                      />
                    </div>
                    <span className="text-sm">{activity}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformancePredictions = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Performance Predictions</h3>
          <button
            onClick={() => setShowPredictions(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Next Week Predictions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Predicted Engagement</p>
                <p className="text-xl font-bold">{performancePredictions.nextWeek?.predictedEngagement.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Content Type</p>
                <p className="text-xl font-bold capitalize">{performancePredictions.nextWeek?.bestContentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Platform</p>
                <p className="text-xl font-bold capitalize">{performancePredictions.nextWeek?.bestPlatform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Time</p>
                <p className="text-xl font-bold">{performancePredictions.nextWeek?.bestTime}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Next Month Predictions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Predicted Growth</p>
                <p className="text-xl font-bold text-green-600">{performancePredictions.nextMonth?.predictedGrowth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Predicted New Followers</p>
                <p className="text-xl font-bold">{performancePredictions.nextMonth?.predictedFollowers.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Recommended Content Strategy</p>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(performancePredictions.nextMonth?.contentStrategy || {}).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <p className="text-sm text-gray-600 capitalize">{type}</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Removed the h1 element with "Social Media Hub" text */}
            </div>
            
            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative group px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeNavItem === item.id
                      ? `bg-gradient-to-r ${item.color} text-white`
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Active Indicator */}
                  {activeNavItem === item.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" />
                  )}
                </button>
              ))}
            </div>

            {/* Search and Settings */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <FaSearch className="text-xl" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <FaCog className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Show social media feeds when Home is selected or no other feature is active */}
        {activeNavItem === 'home' && !showAnalytics && !showCalendar && !showSuggestions && 
         !showCompetitorAnalysis && !showAudienceInsights && !showPredictions && !showHashtagModal && 
         renderSocialMediaFeeds()}

        {/* Feature Modals */}
        {showAnalytics && renderAnalytics()}
        {showCalendar && renderContentCalendar()}
        {showSuggestions && renderContentSuggestions()}
        {showCompetitorAnalysis && renderCompetitorAnalysis()}
        {showAudienceInsights && renderAudienceInsights()}
        {showPredictions && renderPerformancePredictions()}
        {showHashtagModal && renderHashtagModal()}
      </div>
    </div>
  );
};

export default SocialMediaFeed; 