import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { ComplaintService } from '../services/ComplaintService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { FiArrowLeft, FiMapPin, FiCalendar, FiCpu, FiTool, FiCheckCircle, FiClock } from 'react-icons/fi';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, updateComplaintStatus } = useComplaints();
  
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      // Load details using service (simulates network roundtrip)
      const data = await ComplaintService.getComplaintById(id);
      if (data) {
        setComplaint(data);
      } else {
        // Fallback directly to context
        const ctxData = getComplaintById(id);
        setComplaint(ctxData || null);
      }
      setIsLoading(false);
    };

    fetchDetails();
  }, [id, getComplaintById]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      // Simulate Service network request
      await ComplaintService.updateComplaintStatus(id, newStatus);
      // Update Context
      updateComplaintStatus(id, newStatus);
      // Refresh local state
      setComplaint((prev) => ({ ...prev, status: newStatus }));
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <Spinner size="lg" message="Loading complaint file..." className="py-20" />;
  }

  if (!complaint) {
    return (
      <Card className="text-center py-16 max-w-lg mx-auto">
        <FiArrowLeft className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Complaint Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          The complaint ID you specified could not be located in our records.
        </p>
        <Button variant="primary" onClick={() => navigate('/complaints')} className="font-bold">
          Back to Feed
        </Button>
      </Card>
    );
  }

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'pending': return <Badge variant="warning">Pending Review</Badge>;
      case 'in_progress': return <Badge variant="info">In Progress</Badge>;
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
      default: return <Badge variant="slate">{statusVal}</Badge>;
    }
  };

  const getCategoryColor = (catVal) => {
    switch (catVal) {
      case 'Open Manholes': return 'purple';
      case 'Broken/Faulty Street Lights': return 'warning';
      case 'Garbage Dumps': return 'success';
      case 'Potholes / Broken Roads': return 'danger';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back to feed button */}
      <div>
        <button
          onClick={() => navigate('/complaints')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:underline transition"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Complaints Feed
        </button>
      </div>

      {/* Main Title Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{complaint.id}</span>
            <Badge variant={getCategoryColor(complaint.category)} size="sm" className="font-bold">
              {complaint.category}
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white leading-tight">
            {complaint.title}
          </h1>
        </div>
        <div className="flex-shrink-0 self-start sm:self-center">
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      {/* Grid Layout: Left Column (Details) & Right Column (Actions / AI) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Images & Descriptions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Card */}
          <Card className="overflow-hidden p-0 rounded-2xl border border-slate-200 dark:border-slate-800">
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="w-full object-cover max-h-[420px] bg-slate-100 dark:bg-slate-850"
            />
          </Card>

          {/* Issue Details Metadata */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                Issue Log Report
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500 font-semibold">
                <FiCalendar className="h-4 w-4" />
                <span>{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Location Details */}
            <div className="flex gap-2.5 items-start bg-slate-50 dark:bg-slate-800/35 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <FiMapPin className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-700 dark:text-slate-300">Reported Location Address</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{complaint.location}</p>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-2 text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Detailed Description</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                {complaint.description}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side: Authority resolution + CV Panel */}
        <div className="space-y-6">
          {/* Authority Simulation Card */}
          <Card
            title="Municipal Authority Panel"
            subtitle="Simulate resolution workflow (Admin)"
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                As a local admin, update the status of this ticket to initiate field works or resolve the case:
              </p>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant={complaint.status === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  isLoading={updatingStatus && complaint.status === 'pending'}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('pending')}
                  icon={FiClock}
                  className="font-bold py-2.5 justify-start text-xs border-slate-205 dark:border-slate-800"
                >
                  Set as Pending Review
                </Button>
                <Button
                  variant={complaint.status === 'in_progress' ? 'primary' : 'outline'}
                  size="sm"
                  isLoading={updatingStatus && complaint.status === 'in_progress'}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('in_progress')}
                  icon={FiTool}
                  className="font-bold py-2.5 justify-start text-xs border-slate-205 dark:border-slate-800"
                >
                  Set as In Progress
                </Button>
                <Button
                  variant={complaint.status === 'resolved' ? 'primary' : 'outline'}
                  size="sm"
                  isLoading={updatingStatus && complaint.status === 'resolved'}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange('resolved')}
                  icon={FiCheckCircle}
                  className="font-bold py-2.5 justify-start text-xs border-slate-205 dark:border-slate-800"
                >
                  Set as Resolved / Fixed
                </Button>
              </div>
            </div>
          </Card>

          {/* AI Computer Vision Details Panel */}
          <Card
            title="AI Verification Details"
            subtitle="Phase 2 CNN Model Output"
          >
            <div className="space-y-4">
              {/* Coming soon banner */}
              <div className="flex gap-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2.5 text-xs text-indigo-750 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
                <FiCpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 animate-pulse mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wider text-[10px]">AI Integration Pending</span>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400">
                    The CNN classifier backend is scheduled for Phase 2. Currently displaying simulated parameters.
                  </p>
                </div>
              </div>

              {/* AI Details table */}
              <div className="space-y-3.5 text-xs">
                {/* 1. Prediction */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">AI Prediction</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-805 px-2 py-0.5 rounded-md">
                    {complaint.prediction || "Coming Soon"}
                  </span>
                </div>

                {/* 2. Confidence Score */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Confidence Score</span>
                  <span className="font-bold text-slate-850 dark:text-slate-100">
                    {typeof complaint.confidenceScore === 'number' 
                      ? `${(complaint.confidenceScore * 100).toFixed(1)}%` 
                      : complaint.confidenceScore || "Coming Soon"}
                  </span>
                </div>

                {/* 3. Detection Result */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Detection Result</span>
                  <span className="font-bold text-slate-850 dark:text-slate-100">
                    {complaint.detectionResult || "Coming Soon"}
                  </span>
                </div>

                {/* 4. Verification Status */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Verification Status</span>
                  <Badge variant={complaint.verificationStatus.includes('Simulated') ? 'slate' : 'primary'} size="sm" className="font-bold">
                    {complaint.verificationStatus || "Coming Soon"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
