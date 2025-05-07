// src/components/event/CustomPackageModal.jsx

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { createPackage } from '../../services/packageService';

const CustomPackageModal = ({ onClose, onSuccess, createdBy }) => {
  const DEFAULT_IMAGE = 'https://res.cloudinary.com/du5c9fw6s/image/upload/v1742922785/default_zojwtj.avif';

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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
    if (field === 'danceStyles') validateDanceStyles();
  };

  const handlePerformanceChange = (index, key, value) => {
    const updated = [...formData.performances];
    updated[index][key] = value;
    setFormData(prev => ({ ...prev, performances: updated }));
    validatePerformances(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, image: file }));
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'packageName') {
      if (!value.trim()) newErrors.packageName = 'Package name is required';
      else if (value.length < 3) newErrors.packageName = 'Minimum 3 characters';
      else delete newErrors.packageName;
    }

    if (name === 'description') {
      if (!value.trim()) newErrors.description = 'Description is required';
      else if (value.length < 10) newErrors.description = 'Minimum 10 characters';
      else delete newErrors.description;
    }
    setErrors(newErrors);
  };

  const validatePerformances = (performances) => {
    const newErrors = { ...errors };
    performances.forEach((perf, index) => {
      if (!perf.type) newErrors[`perf_type_${index}`] = 'Type is required';
      else delete newErrors[`perf_type_${index}`];

      if (!perf.duration) newErrors[`perf_duration_${index}`] = 'Duration is required';
      else if (!/^[1-9][0-9]*\s?(minutes?|hours?)$/.test(perf.duration)) {
        newErrors[`perf_duration_${index}`] = 'Use format like "30 minutes" or "1 hour"';
      } else delete newErrors[`perf_duration_${index}`];
    });
    setErrors(newErrors);
  };

  const validateDanceStyles = () => {
    const hasValid = formData.danceStyles.some(style => style.trim() !== '');
    const newErrors = { ...errors };
    if (!hasValid) newErrors.danceStyles = 'At least one dance style is required';
    else delete newErrors.danceStyles;
    setErrors(newErrors);
  };

  const validateTeamInvolvement = (updatedTeam) => {
    const { maleDancers, femaleDancers } = updatedTeam;
    const newErrors = { ...errors };

    if (maleDancers <= 0 && femaleDancers <= 0) {
      newErrors.dancers = 'At least one dancer (male or female) is required';
    } else {
      delete newErrors.dancers;
    }

    if (maleDancers > 50) newErrors.maleDancers = 'Maximum 50 male dancers allowed';
    else delete newErrors.maleDancers;

    if (femaleDancers > 50) newErrors.femaleDancers = 'Maximum 50 female dancers allowed';
    else delete newErrors.femaleDancers;

    setErrors(newErrors);
  };

  const isFormValid = () => {
    const { maleDancers, femaleDancers } = formData.teamInvolvement;
    const hasValidDancerCount =
      (maleDancers > 0 || femaleDancers > 0) &&
      maleDancers <= 50 &&
      femaleDancers <= 50;

    return Object.keys(errors).length === 0 &&
      formData.packageName.length >= 3 &&
      formData.description.length >= 10 &&
      formData.danceStyles.some(s => s.trim() !== '') &&
      formData.performances.every(p => p.type && /^[1-9][0-9]*\s?(minutes?|hours?)$/.test(p.duration)) &&
      hasValidDancerCount;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return alert("Fix errors before submitting.");
    try {
      setIsSubmitting(true);
      const res = await createPackage(formData);
      onSuccess(res);
    } catch (err) {
      alert(err.message || 'Failed to create custom package');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative bg-white p-6 rounded-lg w-full mx-auto my-8 max-w-xl sm:max-w-2xl lg:max-w-3xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <XIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-semibold mb-4">Create Custom Package</Dialog.Title>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pb-2">
              <input type="text" name="packageName" placeholder="Package Name"
                value={formData.packageName} onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.packageName && <p className="text-red-500 text-sm">{errors.packageName}</p>}

              <textarea name="description" placeholder="Description" rows="3"
                value={formData.description} onChange={handleChange}
                className="w-full border p-2 rounded"
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

              {/* Performances */}
              <div>
                <p className="font-medium">Performances</p>
                {formData.performances.map((perf, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-2 mb-1">
                    <div className="flex-1">
                      <input placeholder="Type" value={perf.type}
                        onChange={e => handlePerformanceChange(i, 'type', e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                      {errors[`perf_type_${i}`] && <p className="text-red-500 text-sm">{errors[`perf_type_${i}`]}</p>}
                    </div>
                    <div className="flex-1">
                      <input placeholder="Duration (e.g., 30 minutes)" value={perf.duration}
                        onChange={e => handlePerformanceChange(i, 'duration', e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                      {errors[`perf_duration_${i}`] && <p className="text-red-500 text-sm">{errors[`perf_duration_${i}`]}</p>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() =>
                  setFormData(prev => ({ ...prev, performances: [...prev.performances, { type: '', duration: '' }] }))
                } className="text-blue-500 text-sm mt-1">+ Add Performance</button>
              </div>

              {/* Dance Styles */}
              <div>
                <p className="font-medium">Dance Styles</p>
                {formData.danceStyles.map((style, i) => (
                  <input key={i} value={style}
                    onChange={e => handleArrayChange('danceStyles', i, e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                  />
                ))}
                {errors.danceStyles && <p className="text-red-500 text-sm">{errors.danceStyles}</p>}
                <button type="button" onClick={() =>
                  setFormData(prev => ({ ...prev, danceStyles: [...prev.danceStyles, ''] }))
                } className="text-blue-500 text-sm">+ Add Dance Style</button>
              </div>

              {/* Team Involvement */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Male Dancers</label>
                  <input type="number" min="0" max="50" value={formData.teamInvolvement.maleDancers}
                    onChange={e => {
                      const newVal = Number(e.target.value);
                      setFormData(prev => {
                        const updated = {
                          ...prev,
                          teamInvolvement: { ...prev.teamInvolvement, maleDancers: newVal }
                        };
                        validateTeamInvolvement(updated.teamInvolvement);
                        return updated;
                      });
                    }}
                    className="w-full border p-2 rounded"
                  />
                  {errors.maleDancers && <p className="text-red-500 text-sm">{errors.maleDancers}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Female Dancers</label>
                  <input type="number" min="0" max="50" value={formData.teamInvolvement.femaleDancers}
                    onChange={e => {
                      const newVal = Number(e.target.value);
                      setFormData(prev => {
                        const updated = {
                          ...prev,
                          teamInvolvement: { ...prev.teamInvolvement, femaleDancers: newVal }
                        };
                        validateTeamInvolvement(updated.teamInvolvement);
                        return updated;
                      });
                    }}
                    className="w-full border p-2 rounded"
                  />
                  {errors.femaleDancers && <p className="text-red-500 text-sm">{errors.femaleDancers}</p>}
                </div>
              </div>
              {errors.dancers && <p className="text-red-500 text-sm">{errors.dancers}</p>}

              {/* Image Upload with Preview */}
              <div>
                <label className="block mb-1 font-medium">Upload Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border rounded overflow-hidden">
                    <img
                      src={
                        formData.image
                          ? typeof formData.image === 'string'
                            ? formData.image
                            : URL.createObjectURL(formData.image)
                          : DEFAULT_IMAGE
                      }
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Choose File
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
