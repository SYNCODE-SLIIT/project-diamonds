import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Clock, 
  CheckCircle, 
  Calendar as CalendarIcon, 
  MapPin, 
  Plus,
  AlertTriangle,
  BarChart4,
  PieChart,
  LineChart,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { fetchAllEvents } from '../../services/eventService';
import { fetchAllRequests } from '../../services/eventRequestService';
import { useNavigate } from 'react-router-dom';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';
import CustomLineChart from '../../components/Charts/CustomLineChart';

const EventDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Data states
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [guestRange, setGuestRange] = useState([0, 1000]); // Default range

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    pendingRequests: 0,
    expectedGuests: 0,
    topServices: [],
    avgGuestCount: 0,
    memberStats: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0
    },
    statusBreakdown: [],
    weekOverWeekChange: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both events and requests
        const [eventsData, requestsData] = await Promise.all([
          fetchAllEvents(),
          fetchAllRequests()
        ]);
        
        setEvents(eventsData);
        setRequests(requestsData);
        
        // Calculate analytics
        calculateAnalytics(eventsData, requestsData);
        
        // Set initial filtered events
        setFilteredEvents(eventsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate all analytics from data
  const calculateAnalytics = (eventsData, requestsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter events by date
    const upcomingEvents = eventsData.filter(event => new Date(event.eventDate) > now);
    const completedEvents = eventsData.filter(event => new Date(event.eventDate) <= now);
    
    // Filter events for current month
    const currentMonthEvents = eventsData.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
    
    // Calculate total guests expected this month
    const expectedGuests = currentMonthEvents.reduce((sum, event) => sum + event.guestCount, 0);
    
    // Calculate average guest count
    const avgGuestCount = eventsData.length > 0 
      ? Math.round(eventsData.reduce((sum, event) => sum + event.guestCount, 0) / eventsData.length) 
      : 0;
    
    // Count pending requests
    const pendingRequests = requestsData.filter(req => req.status === 'pending').length;
    
    // Calculate week-over-week change
    const lastWeekEnd = new Date(now);
    const lastWeekStart = new Date(now);
    lastWeekEnd.setDate(now.getDate() - now.getDay());
    lastWeekStart.setDate(lastWeekEnd.getDate() - 7);
    
    const twoWeeksAgoStart = new Date(lastWeekStart);
    twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 7);
    
    const lastWeekEvents = eventsData.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= lastWeekStart && eventDate < lastWeekEnd;
    }).length;
    
    const twoWeeksAgoEvents = eventsData.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate >= twoWeeksAgoStart && eventDate < lastWeekStart;
    }).length;
    
    const weekOverWeekChange = twoWeeksAgoEvents > 0 
      ? ((lastWeekEvents - twoWeeksAgoEvents) / twoWeeksAgoEvents) * 100 
      : (lastWeekEvents > 0 ? 100 : 0);
    
    // Collect all services used across events
    const allServices = eventsData.flatMap(event => event.additionalServices || []);
    
    // Count service usage frequency
    const serviceUsageCounts = {};
    allServices.forEach(service => {
      const serviceName = service.serviceID?.serviceName || 'Unknown';
      serviceUsageCounts[serviceName] = (serviceUsageCounts[serviceName] || 0) + 1;
    });
    
    // Get top 3 most used services
    const topServices = Object.entries(serviceUsageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    // Calculate member assignment statistics
    const allAssignedMembers = eventsData.flatMap(event => event.membersAssigned || []);
    const memberStats = {
      total: allAssignedMembers.length,
      pending: allAssignedMembers.filter(m => m.status === 'Pending').length,
      accepted: allAssignedMembers.filter(m => m.status === 'Accepted').length,
      rejected: allAssignedMembers.filter(m => m.status === 'Rejected').length
    };
    
    // Calculate status breakdown for pie chart
    const statusCounts = requestsData.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusBreakdown = Object.entries(statusCounts).map(([name, amount]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount
    }));
    
    setAnalytics({
      totalEvents: eventsData.length,
      upcomingEvents: upcomingEvents.length,
      completedEvents: completedEvents.length,
      pendingRequests,
      expectedGuests,
      topServices,
      avgGuestCount,
      memberStats,
      statusBreakdown,
      weekOverWeekChange
    });
  };

  // Apply filters to events
  useEffect(() => {
    const now = new Date();
    
    let filtered = [...events];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.eventName.toLowerCase().includes(query) || 
        event.eventLocation.toLowerCase().includes(query) || 
        (event.organizerID && event.organizerID.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.eventDate) < now);
    } else if (dateFilter === 'today') {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.eventDate) > now);
    }
    
    // Apply location filter if not 'all'
    if (locationFilter !== 'all') {
      filtered = filtered.filter(event => event.eventLocation === locationFilter);
    }
    
    // Apply package filter if not 'all'
    if (packageFilter !== 'all') {
      filtered = filtered.filter(event => 
        event.packageID && event.packageID.packageName === packageFilter
      );
    }
    
    // Apply guest range filter
    filtered = filtered.filter(event => 
      event.guestCount >= guestRange[0] && event.guestCount <= guestRange[1]
    );
    
    setFilteredEvents(filtered);
  }, [events, searchQuery, statusFilter, dateFilter, locationFilter, packageFilter, guestRange]);

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(events.map(event => event.eventLocation))];
  
  // Get unique package types for filter dropdown
  const uniquePackages = [...new Set(
    events
      .filter(event => event.packageID && event.packageID.packageName)
      .map(event => event.packageID.packageName)
  )];

  // Event Analytics Card component
  const AnalyticsCard = ({ title, value, icon, trend, chart, color = "bg-blue-500" }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <span className={`ml-2 flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          {chart}
        </div>
      </div>
    </div>
  );

  // Mini-chart for event count by month (for Total Events card)
  const EventCountChart = () => {
    // Group events by month
    const eventsByMonth = events.reduce((acc, event) => {
      const date = new Date(event.eventDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array for charting
    const chartData = Object.entries(eventsByMonth)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: new Date(year, monthNum - 1).toLocaleDateString('default', { month: 'short' }),
          count,
          category: 'Events',
          amount: count
        };
      })
      .sort((a, b) => {
        const monthsOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
        return monthsOrder[a.month] - monthsOrder[b.month];
      })
      .slice(-6); // Last 6 months
      
    return <CustomBarChart data={chartData} />;
  };

  // Pie chart for request status breakdown
  const RequestStatusPieChart = () => {
    const COLORS = ["#FFC107", "#4CAF50", "#F44336", "#FF9800"];
    
    return (
      <div className="h-[100px]">
        <CustomPieChart
          data={analytics.statusBreakdown}
          colors={COLORS}
          showTextAnchor={false}
        />
      </div>
    );
  };

  // Line chart for guest trends
  const GuestTrendChart = () => {
    // Group events by month and sum guest counts
    const guestsByMonth = events.reduce((acc, event) => {
      const date = new Date(event.eventDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      acc[monthKey] = (acc[monthKey] || 0) + event.guestCount;
      return acc;
    }, {});
    
    // Convert to array for charting
    const chartData = Object.entries(guestsByMonth)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: new Date(year, monthNum - 1).toLocaleDateString('default', { month: 'short' }),
          amount: count,
          category: 'Guests'
        };
      })
      .sort((a, b) => {
        const monthsOrder = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
                             'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
        return monthsOrder[a.month] - monthsOrder[b.month];
      })
      .slice(-6); // Last 6 months
      
    return <CustomLineChart data={chartData} />;
  };

  // Horizontal bar chart for service usage
  const ServiceUsageChart = () => {
    const chartData = analytics.topServices.map(service => ({
      name: service.name,
      amount: service.count,
      category: 'Service Usage'
    }));
    
    return (
      <div className="h-[100px]">
        <CustomBarChart data={chartData} />
      </div>
    );
  };

  // Stacked bar chart for member assignment statistics
  const MemberStatsChart = () => {
    const data = [
      {
        name: 'Members',
        pending: analytics.memberStats.pending,
        accepted: analytics.memberStats.accepted,
        rejected: analytics.memberStats.rejected,
        amount: analytics.memberStats.total,
        category: 'Member Status'
      }
    ];
    
    return (
      <div className="h-[100px]">
        <CustomBarChart data={data} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-900 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Event Analytics Dashboard</h1>
          <button 
            onClick={() => navigate('create')}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Event
          </button>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard 
            title="Total Events" 
            value={analytics.totalEvents}
            icon={<Calendar className="w-5 h-5" />}
            trend={analytics.weekOverWeekChange}
            chart={<EventCountChart />}
            color="bg-blue-500"
          />
          
          <AnalyticsCard 
            title="Upcoming Events" 
            value={analytics.upcomingEvents}
            icon={<CalendarIcon className="w-5 h-5" />}
            chart={<div className="h-[100px]"></div>}
            color="bg-green-500"
          />
          
          <AnalyticsCard 
            title="Completed Events" 
            value={analytics.completedEvents}
            icon={<CheckCircle className="w-5 h-5" />}
            chart={<div className="h-[100px]"></div>}
            color="bg-purple-500"
          />
          
          <AnalyticsCard 
            title="Pending Event Requests" 
            value={analytics.pendingRequests}
            icon={<Clock className="w-5 h-5" />}
            chart={<RequestStatusPieChart />}
            color="bg-yellow-500"
          />
          
          <AnalyticsCard 
            title="Expected Guests This Month" 
            value={analytics.expectedGuests}
            icon={<Users className="w-5 h-5" />}
            chart={<GuestTrendChart />}
            color="bg-red-500"
          />
          
          <AnalyticsCard 
            title="Top Service Usage" 
            value={analytics.topServices[0]?.name || "N/A"}
            icon={<Package className="w-5 h-5" />}
            chart={<ServiceUsageChart />}
            color="bg-indigo-500"
          />
          
          <AnalyticsCard 
            title="Avg. Guest Count" 
            value={analytics.avgGuestCount}
            icon={<Users className="w-5 h-5" />}
            chart={<div className="h-[100px]"></div>}
            color="bg-amber-500"
          />
          
          <AnalyticsCard 
            title="Team Assignments" 
            value={analytics.memberStats.total}
            icon={<Layers className="w-5 h-5" />}
            chart={<MemberStatsChart />}
            color="bg-teal-500"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by event name, location, or organizer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="change-requested">Change Requested</option>
              </select>
            </div>
            
            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Dates</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
            
            {/* Location Filter */}
            <div>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            {/* Package Filter */}
            <div>
              <select
                value={packageFilter}
                onChange={e => setPackageFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Packages</option>
                {uniquePackages.map(pkg => (
                  <option key={pkg} value={pkg}>{pkg}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Guest Range Slider */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Guest Count: {guestRange[0]} - {guestRange[1]}</p>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              value={guestRange[1]} 
              onChange={e => setGuestRange([guestRange[0], parseInt(e.target.value)])} 
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        </div>

        {/* Event Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-md">
              <p className="text-gray-500">No events found matching your criteria.</p>
            </div>
          ) : (
            filteredEvents.map(event => (
              <div 
                key={event._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`${event._id}`)}
              >
                {/* Card image with overlays */}
                <div 
                  className="h-48 bg-cover bg-center relative" 
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069')` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  
                  {/* Bottom left overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center text-white">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">{event.eventLocation}</span>
                  </div>
                  
                  {/* Bottom right overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center bg-black/50 px-2 py-1 rounded-full text-white">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span className="text-xs font-medium">
                      {new Date(event.eventDate).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                {/* Card content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{event.eventName}</h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{event.guestCount} guests</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                    
                    {event.packageID && (
                      <span className="text-xs text-gray-500">
                        {event.packageID.packageName}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="flex -space-x-2">
                      {/* Show assigned member avatars (just placeholders) */}
                      {Array.from({ length: Math.min(3, (event.membersAssigned?.length || 0)) }).map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border border-white"></div>
                      ))}
                      
                      {(event.membersAssigned?.length || 0) > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-gray-600">
                          +{event.membersAssigned.length - 3}
                        </div>
                      )}
                    </div>
                    
                    {event.membersAssigned?.length > 0 ? (
                      <span className="ml-2">
                        {event.membersAssigned.filter(m => m.status === 'Accepted').length} assigned
                      </span>
                    ) : (
                      <span className="ml-2">No members assigned</span>
                    )}
                  </div>
                  
                  <button 
                    className="w-full mt-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-700 hover:to-red-900 transition-all text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${event._id}`);
                    }}
                  >
                    Manage Event
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDashboard; 