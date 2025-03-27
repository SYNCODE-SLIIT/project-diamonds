// src/components/event/CustomPackageModal.jsx

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { createPackage } from '../../services/packageService';

const CustomPackageModal = ({ onClose, onSuccess, createdBy }) => {
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    performances: [{ type: '', duration: '' }],
    danceStyles: [''],
    teamInvolvement: {
      maleDancers: 0,
      femaleDancers: 0,
      choreographers: 1,
      MC: 0,
    },
    image: null,
    type: 'custom',
    status: 'pending',
    createdBy,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handlePerformanceChange = (index, key, value) => {
    const updated = [...formData.performances];
    updated[index][key] = value;
    setFormData(prev => ({ ...prev, performances: updated }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await createPackage(formData);
      onSuccess(res);
    } catch (error) {
      alert(error.message || 'Failed to create custom package');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal content */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative bg-white p-6 rounded-lg max-w-2xl w-full"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <XIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-semibold mb-4">Create Custom Package</Dialog.Title>

            <div className="space-y-4">
              <input
                type="text"
                name="packageName"
                placeholder="Package Name"
                value={formData.packageName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full border p-2 rounded"
              />

              {/* Performances */}
              <div className="space-y-2">
                <p className="font-medium">Performances</p>
                {formData.performances.map((perf, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Type"
                      value={perf.type}
                      onChange={e => handlePerformanceChange(i, 'type', e.target.value)}
                      className="flex-1 border p-2 rounded"
                    />
                    <input
                      placeholder="Duration"
                      value={perf.duration}
                      onChange={e => handlePerformanceChange(i, 'duration', e.target.value)}
                      className="flex-1 border p-2 rounded"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      performances: [...prev.performances, { type: '', duration: '' }]
                    }))
                  }
                  className="text-blue-500 text-sm"
                >
                  + Add Performance
                </button>
              </div>

              {/* Dance Styles */}
              <div>
                <p className="font-medium">Dance Styles</p>
                {formData.danceStyles.map((style, i) => (
                  <input
                    key={i}
                    value={style}
                    onChange={e => handleArrayChange('danceStyles', i, e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setFormData(prev => ({ ...prev, danceStyles: [...prev.danceStyles, ''] }))
                  }
                  className="text-blue-500 text-sm"
                >
                  + Add Dance Style
                </button>
              </div>

              {/* Team Involvement */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Male Dancers"
                  value={formData.teamInvolvement.maleDancers}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      teamInvolvement: {
                        ...prev.teamInvolvement,
                        maleDancers: Number(e.target.value),
                      }
                    }))
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Female Dancers"
                  value={formData.teamInvolvement.femaleDancers}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      teamInvolvement: {
                        ...prev.teamInvolvement,
                        femaleDancers: Number(e.target.value),
                      }
                    }))
                  }
                  className="border p-2 rounded"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block mb-1 font-medium">Upload Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  );
};

export default CustomPackageModal;