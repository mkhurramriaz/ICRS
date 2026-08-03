import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { ComplaintService } from '../services/ComplaintService';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { ImageUpload } from '../components/complaint/ImageUpload';
import { Spinner } from '../components/common/Spinner';
import { FiAlertTriangle, FiPlus } from 'react-icons/fi';

export const ReportComplaint = () => {
  const { addComplaint } = useComplaints();
  const navigate = useNavigate();

  // Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  // Error and Loading States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Open Manholes",
    "Broken/Faulty Street Lights",
    "Garbage Dumps",
    "Potholes / Broken Roads"
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category selection is required';
    if (!location.trim()) newErrors.location = 'Location details are required';
    if (!description.trim()) newErrors.description = 'Issue description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate Service network roundtrip
      const submissionData = { title, category, location, description, imageUrl };
      await ComplaintService.createComplaint(submissionData);
      
      // Commit to local Context state
      addComplaint(submissionData);
      
      // Navigate to complaints listing
      navigate('/complaints');
    } catch (err) {
      console.error("Failed to submit civic issue", err);
      alert("Submission failed. Please check network configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-850 dark:text-white">
          Report a Civic Issue
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Submit details and photos of the infrastructure problem. Municipal departments will review the ticket.
        </p>
      </div>

      {isSubmitting && <Spinner fullPage message="Registering civic complaint and initiating AI models..." />}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-955/15 p-4 border border-amber-250/20 text-xs">
            <FiAlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-450 uppercase tracking-wide">Verification Warning</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                Please upload clear photos from stable angles. Computer vision models will verify details, and false reports may affect profile credibility.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Title field */}
            <Input
              id="title"
              label="Issue Summary Title"
              placeholder="e.g. Broken streetlight causing complete darkness"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
            />

            {/* Grid for Category and Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                id="category"
                label="Civic Category"
                placeholder="Select category type"
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                error={errors.category}
              />

              <Input
                id="location"
                label="Location Details"
                placeholder="e.g. Near H-3 Block, Main St"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
              />
            </div>

            {/* Description field */}
            <Textarea
              id="description"
              label="Comprehensive Description"
              placeholder="Provide a detailed description of the problem (causes, traffic impact, safety risks, duration, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
            />

            {/* Image upload widget */}
            <ImageUpload
              onImageSelected={(url) => setImageUrl(url)}
              error={errors.image}
            />
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={FiPlus}
              isLoading={isSubmitting}
              className="font-bold px-6"
            >
              File Report
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
