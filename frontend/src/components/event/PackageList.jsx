import React, { useState, useEffect } from 'react';
import { getPackages, deletePackage } from '../../services/packageService';
import PackageForm from './PackageForm';

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
      setPackages(data);
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

  if (loading && packages.length === 0) {
    return <div className="text-center p-5">Loading packages...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dance Performance Packages</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleAddNew}
        >
          Add New Package
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {packages.length === 0 && !loading ? (
        <div className="text-center p-5">No packages found. Create your first package!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="border rounded-lg shadow-md overflow-hidden">
              {/* Package Image */} 
              <img 
                src={pkg.image} 
                alt={pkg.packageName} 
                className="w-full h-48 object-cover" 
              />

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{pkg.packageName}</h2>
                  <span className={`px-2 py-1 rounded text-xs ${
                    pkg.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pkg.status}
                  </span>
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
                    ${Number(pkg.price).toFixed(2)}
                    {pkg.travelFees > 0 && (
                      <span className="text-sm font-normal text-gray-600">
                        &nbsp;+ ${Number(pkg.travelFees).toFixed(2)} travel fee
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

      {/* Package Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {currentPackage ? 'Edit Package' : 'Create New Package'}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>
            <PackageForm
              package={currentPackage}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
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
