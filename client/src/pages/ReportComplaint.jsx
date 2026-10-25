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
import { FiAlertTriangle, FiPlus, FiMapPin, FiNavigation, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

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

  // Geolocation State
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'detecting' | 'acquired' | 'error'
  const [geoError, setGeoError] = useState('');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('detecting');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeoStatus('acquired');
        setGeoError('');
        // Clear coordinate validation error if present
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.coords;
          return updated;
        });
      },
      (error) => {
        setGeoStatus('error');
        let errorMsg = 'Failed to obtain device location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser settings to file a complaint.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable on your device.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please click retry.';
        }
        setGeoError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  React.useEffect(() => {
    requestLocation();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category selection is required';
    if (!location.trim()) newErrors.location = 'Location details are required';
    if (!description.trim()) newErrors.description = 'Issue description is required';
    if (!imageUrl) newErrors.image = 'Image is required';
    
    if (coords.latitude === null || coords.longitude === null || isNaN(coords.latitude) || isNaN(coords.longitude)) {
      newErrors.coords = geoError || 'Valid device GPS coordinates are required. Please enable location access.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [duplicateModal, setDuplicateModal] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Submit to backend
      const result = await ComplaintService.createComplaint({
        title,
        category,
        location,
        description,
        imageUrl,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      // Commit to local Context state using the returned backend data structure
      addComplaint(result.data);
      
      // If backend detected a possible duplicate, display the warning modal
      if (result.isDuplicate || result.data?.isDuplicate) {
        setDuplicateModal({
          masterComplaintId: result.duplicateInfo?.masterComplaintId || result.data?.masterComplaintId || 'Existing Reference',
          distanceMeters: result.duplicateInfo?.distanceMeters || result.data?.distanceMeters,
          createdId: result.data?.id
        });
      } else {
        // Navigate directly to complaints listing
        navigate('/complaints');
      }
    } catch (err) {
      console.error("Failed to submit civic issue", err);
      alert(err.message || "Submission failed. Please check network configuration.");
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

      {/* Duplicate Warning Dialog */}
      {duplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-850 dark:text-white">
                  Similar Issue Reported Nearby
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Potential Duplicate Notice
                </p>
              </div>
            </div>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-350 leading-relaxed bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
              <p>
                A similar civic complaint is already recorded approximately{' '}
                <strong className="text-amber-700 dark:text-amber-300">
                  {duplicateModal.distanceMeters ? `${duplicateModal.distanceMeters} meters` : 'within 100 meters'}
                </strong>{' '}
                from this location (Reference Ticket #{duplicateModal.masterComplaintId}).
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Your report has still been saved and linked to ensure municipal teams are aware of ongoing community impact.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                onClick={() => navigate('/complaints')}
                className="font-bold w-full"
              >
                View Complaints Feed
              </Button>
            </div>
          </Card>
        </div>
      )}

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

            {/* GPS Location Status Indicator */}
            <div className="p-3.5 rounded-xl border text-xs transition-all duration-200 bg-slate-50 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {geoStatus === 'detecting' && (
                    <>
                      <FiNavigation className="h-4 w-4 text-brand-500 animate-spin flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Detecting device GPS coordinates...</span>
                    </>
                  )}
                  {geoStatus === 'acquired' && (
                    <>
                      <FiCheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        GPS Location Attached: <span className="font-mono text-emerald-600 dark:text-emerald-400">{coords.latitude.toFixed(4)}°, {coords.longitude.toFixed(4)}°</span>
                      </span>
                    </>
                  )}
                  {geoStatus === 'error' && (
                    <>
                      <FiAlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-600 dark:text-red-400 font-medium">{geoError || 'GPS location unavailable.'}</span>
                    </>
                  )}
                  {geoStatus === 'idle' && (
                    <>
                      <FiMapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500 font-medium">GPS location not acquired.</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={geoStatus === 'detecting'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiRefreshCw className={`h-3 w-3 ${geoStatus === 'detecting' ? 'animate-spin' : ''}`} />
                  <span>{geoStatus === 'acquired' ? 'Refresh GPS' : 'Retry GPS'}</span>
                </button>
              </div>

              {errors.coords && (
                <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
                  <FiAlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.coords}
                </p>
              )}
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
