import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdditionalServiceForm from './AdditionalServiceForm';

const AdditionalServicesList = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching additional services', error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Additional Services</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
        >
          Add New Service
        </button>
      </div>

      {/* Grid Layout for Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service._id} 
            className="relative bg-white rounded-lg p-6 flex flex-col border border-black"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold mb-2">{service.serviceName}</h3>
              <span 
                className={`px-3 py-1 text-sm rounded-md ${
                  service.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {service.status.toLowerCase() === 'available' ? 'approved' : 'unavailable'}
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

      {/* Modal for Additional Service Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowForm(false);
                  setEditingService(null);
                }}
              >
                ✕
              </button>
            </div>
            <AdditionalServiceForm
              service={editingService}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingService(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalServicesList;
