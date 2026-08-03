import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { ComplaintCard } from '../components/complaint/ComplaintCard';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { FiSearch, FiSliders, FiInbox, FiRefreshCw } from 'react-icons/fi';

export const ComplaintsList = () => {
  const { complaints } = useComplaints();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Categories list for dropdown
  const categoriesList = [
    { label: "All Categories", value: "" },
    { label: "Open Manholes", value: "Open Manholes" },
    { label: "Broken/Faulty Street Lights", value: "Broken/Faulty Street Lights" },
    { label: "Garbage Dumps", value: "Garbage Dumps" },
    { label: "Potholes / Broken Roads", value: "Potholes / Broken Roads" }
  ];

  // Statuses list for dropdown
  const statusesList = [
    { label: "All Statuses", value: "" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Resolved", value: "resolved" }
  ];

  // Filter complaints based on user input
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = categoryFilter === '' || c.category === categoryFilter;
    const matchesStatus = statusFilter === '' || c.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-850 dark:text-white">
          Civic Complaints Feed
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Search, filter, and track public issues submitted across municipal zones.
        </p>
      </div>

      {/* Filter and Search Action Box */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            <FiSliders className="h-4.5 w-4.5 text-brand-500" />
            <span>Search & Filter Parameters</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search Input */}
            <Input
              id="search-input"
              placeholder="Search by ID, keyword, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={FiSearch}
            />

            {/* Category Select */}
            <Select
              id="category-filter"
              placeholder="Select Category"
              options={categoriesList}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />

            {/* Status Select */}
            <Select
              id="status-filter"
              placeholder="Select Status"
              options={statusesList}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          {/* Clear filters utility link */}
          {(search || categoryFilter || statusFilter) && (
            <div className="flex justify-end mt-1">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-450 dark:hover:text-brand-400 hover:underline"
              >
                <FiRefreshCw className="h-3 w-3" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-850 text-slate-405 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
              <FiInbox className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-805 dark:text-slate-205">No matches found</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                We couldn't find any complaints matching your current filters. Try refining your keyword or clearing the dropdown selections.
              </p>
            </div>
            {(search || categoryFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                className="mt-2 text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition duration-150"
              >
                Reset Filters
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="animate-in fade-in slide-in-from-bottom-5 duration-300"
            >
              <ComplaintCard complaint={complaint} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
