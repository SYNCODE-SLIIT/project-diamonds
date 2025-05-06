import React, { useState, useEffect } from 'react';
import { getPackages, deletePackage } from '../../services/packageService';
import PackageForm from './PackageForm';

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  
  // Filter, sort, and search states
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateCreated');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
      setPackages(data);
      setFilteredPackages(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Apply filters, sorting, and search whenever dependencies change
  useEffect(() => {
    let result = [...packages];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'system') {
        result = result.filter(pkg => pkg.type === 'system');
      } else if (typeFilter === 'custom') {
        result = result.filter(pkg => pkg.type === 'custom');
      } else if (typeFilter === 'custom-pending') {
        result = result.filter(pkg => pkg.type === 'custom' && pkg.status !== 'approved');
      } else if (typeFilter === 'custom-approved') {
        result = result.filter(pkg => pkg.type === 'custom' && pkg.status === 'approved');
      }
    }
    
    // Apply search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(pkg => 
        pkg.packageName.toLowerCase().includes(query) || 
        pkg.description.toLowerCase().includes(query) ||
        pkg.packageID.toLowerCase().includes(query) ||
        (pkg.danceStyles && pkg.danceStyles.some(style => style.toLowerCase().includes(query)))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateCreated') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'price') {
        const priceA = Number(a.price || 0);
        const priceB = Number(b.price || 0);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      }
      // Default to name sorting if other options fail
      return sortOrder === 'asc' 
        ? a.packageName.localeCompare(b.packageName)
        : b.packageName.localeCompare(a.packageName);
    });
    
    setFilteredPackages(result);
  }, [packages, typeFilter, searchQuery, sortBy, sortOrder]);

  // Open form for creating a new package
  const handleAddNew = () => {
    setCurrentPackage(null);
    setShowForm(true);
  };

  // Open form for editing an existing package
  const handleEdit = (pkg) => {
    setCurrentPackage(pkg);
    setShowForm(true);
  };

  // Confirm delete modal
  const handleDeleteConfirm = (pkg) => {
    setPackageToDelete(pkg);
    setShowDeleteModal(true);
  };

  // Delete a package
  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage(packageToDelete._id);
      setShowDeleteModal(false);
      setPackageToDelete(null);
      fetchPackages();
    } catch (err) {
      setError(err.message || 'Failed to delete package');
      setShowDeleteModal(false);
    }
  };

  // After form submission
  const handleFormSuccess = () => {
    setShowForm(false);
    fetchPackages();
  };

  // Handle filter and sort changes
  const handleFilterChange = (e) => {
    setTypeFilter(e.target.value);
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
  
  // Handler for returning to the package list
  const handleBackToList = () => {
    setShowForm(false);
    setCurrentPackage(null);
  };

  if (loading && packages.length === 0) {
    return <div className="text-center p-5 bg-gray-100">Loading packages...</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Dance Performance Packages</h1>
        {!showForm && (
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleAddNew}
          >
            Add New Package
          </button>
        )}
      </div>

      {!showForm ? (
        <>
          {/* Filter, sort, and search controls */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search packages..."
                  className="w-full p-2 border rounded"
                />
              </div>
              
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                <select 
                  value={typeFilter} 
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All Types</option>
                  <option value="system">System</option>
                  <option value="custom">All Custom</option>
                  <option value="custom-pending">Custom Pending</option>
                  <option value="custom-approved">Custom Approved</option>
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md mb-4">
              {error}
            </div>
          )}

          {filteredPackages.length === 0 && !loading ? (
            <div className="text-center p-5 bg-white rounded-lg shadow-md">
              {packages.length === 0 ? 
                "No packages found. Create your first package!" : 
                "No packages match your filter criteria."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg._id} className="border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white">
                  {/* Package Image */} 
                  <img 
                    src={pkg.image} 
                    alt={pkg.packageName} 
                    className="w-full h-48 object-cover" 
                  />

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold">{pkg.packageName}</h2>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          pkg.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pkg.status}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {pkg.type}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">ID: {pkg.packageID}</p>
                    <p className="mb-3">{pkg.description}</p>
                    
                    <div className="mb-3">
                      <p className="font-medium">Dance Styles:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pkg.danceStyles && pkg.danceStyles.map((style, idx) => (
                          <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="font-medium">Team:</p>
                      <p className="text-sm">
                        {pkg.teamInvolvement ? (
                          <>
                            {pkg.teamInvolvement.maleDancers} Male, {pkg.teamInvolvement.femaleDancers} Female dancers, {pkg.teamInvolvement.choreographers} choreographer(s)
                            {pkg.teamInvolvement.MC > 0 && `, ${pkg.teamInvolvement.MC} MC(s)`}
                          </>
                        ) : null}
                      </p>
                    </div>
                    
                    {pkg.price !== null && pkg.price !== undefined && (
                      <p className="text-lg font-bold mt-2 mb-3">
                        Rs.{Number(pkg.price).toFixed(2)}
                        {pkg.travelFees > 0 && (
                          <span className="text-sm font-normal text-gray-600">
                            &nbsp;+ Rs.{Number(pkg.travelFees).toFixed(2)} travel fee
                          </span>
                        )}
                      </p>
                    )}
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        onClick={() => handleEdit(pkg)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeleteConfirm(pkg)}
                      >
                        Delete
                      </button>
                    </div>
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
              {currentPackage ? 'Edit Package' : 'Create New Package'}
            </h2>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded"
              onClick={handleBackToList}
            >
              Back to List
            </button>
          </div>
          <PackageForm
            package={currentPackage}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete the package "{packageToDelete?.packageName}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageList;
