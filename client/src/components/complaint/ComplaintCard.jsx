import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FiMapPin, FiEye, FiCpu } from 'react-icons/fi';

export const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  const { id, title, category, location, imageUrl, status, createdAt, prediction } = complaint;

  const getStatusVariant = (statusVal) => {
    switch (statusVal) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      default: return 'slate';
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
    <Card hoverEffect className="flex flex-col h-full overflow-hidden p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      {/* Image Panel wrapper */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {/* Status Pill overlay */}
        <div className="absolute top-3 right-3 shadow-md">
          <Badge variant={getStatusVariant(status)} className="capitalize px-3 py-1 font-bold text-xs">
            {status.replace('_', ' ')}
          </Badge>
        </div>
        {/* Category Pill overlay bottom */}
        <div className="absolute bottom-3 left-3 shadow-sm">
          <Badge variant={getCategoryColor(category)} size="sm" className="font-bold">
            {category}
          </Badge>
        </div>
      </div>

      {/* Info details panel */}
      <div className="flex flex-col flex-1 p-5 gap-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{id}</span>
            {complaint.isDuplicate && (
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                Nearby Duplicate
              </span>
            )}
          </div>
          <h4 className="text-base font-extrabold text-slate-850 dark:text-slate-100 leading-snug line-clamp-1">
            {title}
          </h4>
        </div>

        {/* Location snippet */}
        <div className="flex items-start gap-1.5 text-xs text-slate-550 dark:text-slate-400">
          <FiMapPin className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1 leading-relaxed">{location}</span>
        </div>

        {/* Truncated description summary */}
        <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-2 leading-relaxed flex-1">
          {complaint.description}
        </p>

        {/* AI verification details badge */}
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2 text-xs text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
          <FiCpu className="h-4 w-4 animate-pulse flex-shrink-0" />
          <span className="font-semibold truncate">
            CV Model: <span className="font-black text-[10px] uppercase ml-0.5">{prediction || "Coming Soon"}</span>
          </span>
        </div>

        {/* Action Button footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-850 pt-4 mt-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
            {new Date(createdAt).toLocaleDateString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={FiEye}
            onClick={() => navigate(`/complaints/${id}`)}
            className="font-bold border-brand-500/20 text-brand-650 hover:bg-brand-500 hover:text-white"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
