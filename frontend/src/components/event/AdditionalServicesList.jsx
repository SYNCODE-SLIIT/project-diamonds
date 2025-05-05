import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdditionalServiceForm from './AdditionalServiceForm';

const AdditionalServicesList = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Filter, sort, and search states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
      setFilteredServices(res.data);
    } catch (error) {
      console.error('Error fetching additional services', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);
  
  // Apply filters, sorting, and search whenever dependencies change
  useEffect(() => {
    let result = [...services];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(service => service.category === categoryFilter);
    }
    
    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(service => service.status === availabilityFilter);
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(service => 
        service.serviceName.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query) ||
        service.serviceID.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.createdBy.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateCreated') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.serviceName.localeCompare(b.serviceName)
          : b.serviceName.localeCompare(a.serviceName);
      }
      return 0;
    });
    
    setFilteredServices(result);
  }, [services, categoryFilter, availabilityFilter, searchQuery, sortBy, sortOrder]);

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleFormSubmit = (serviceData) => {
    if (editingService) {
      axios
        .put(`/api/services/${editingService._id}`, serviceData)
        .then(() => {
          setShowForm(false);
          setEditingService(null);
          fetchServices();
        })
        .catch((error) => console.error('Error updating service', error));
    } else {
      axios
        .post('/api/services', serviceData)
        .then(() => {
          setShowForm(false);
          fetchServices();
        })
        .catch((error) => console.error('Error creating service', error));
    }
  };

  const handleDelete = (serviceId) => {
    axios
      .delete(`/api/services/${serviceId}`)
      .then(() => {
        fetchServices();
      })
      .catch((error) => console.error('Error deleting service', error));
  };
  
  // Handle filter and sort changes
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  const handleAvailabilityFilterChange = (e) => {
    setAvailabilityFilter(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleBackToList = () => {
    setShowForm(false);
    setEditingService(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold">Additional Services</h2>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
          >
            Add New Service
          </button>
        )}
      </div>

      {!showForm ? (
        <>
          {/* Filter, sort, and search controls */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search services..."
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={categoryFilter} 
                  onChange={handleCategoryFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All Categories</option>
                  <option value="Choreography">Choreography</option>
                  <option value="Styling">Styling</option>
                  <option value="Stage Effects">Stage Effects</option>
                  <option value="Photography">Photography</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select 
                  value={availabilityFilter} 
                  onChange={handleAvailabilityFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={handleSortChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="dateCreated">Date Created</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <select 
                  value={sortOrder} 
                  onChange={handleSortOrderChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Layout for Services */}
          {filteredServices.length === 0 ? (
            <div className="text-center p-5 bg-white rounded-lg shadow-md">
              {services.length === 0 ? 
                "No services found. Add your first service!" : 
                "No services match your filter criteria."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div 
                  key={service._id} 
                  className="relative bg-white rounded-lg p-6 flex flex-col shadow-md border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold mb-2">{service.serviceName}</h3>
                    <span 
                      className={`px-3 py-1 text-sm rounded-md ${
                        service.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.status.toLowerCase() === 'available' ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mt-2">ID: {service.serviceID}</p>
                  
                  <p className="my-3">{service.description}</p>
                  
                  <div className="mt-4">
                    <p className="font-semibold">Category:</p>
                    <p>{service.category}</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="font-semibold">Team:</p>
                    <p>{service.createdBy}</p>
                  </div>
                  
                  <div className="mt-4 mb-4 text-2xl font-bold">
                    Rs.{service.price}
                  </div>
                  
                  <div className="mt-auto flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded"
              onClick={handleBackToList}
            >
              Back to List
            </button>
          </div>
          <AdditionalServiceForm
            service={editingService}
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
          />
        </div>
      )}
    </div>
  );
};

export default AdditionalServicesList;
