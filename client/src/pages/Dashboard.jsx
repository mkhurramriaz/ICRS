import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { FiPlus, FiAlertCircle, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { refreshComplaints, complaints } = useComplaints();
  
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    byCategory: {
      "Open Manholes": 0,
      "Broken/Faulty Street Lights": 0,
      "Garbage Dumps": 0,
      "Potholes / Broken Roads": 0
    }
  });
  const [loadingStats, setLoadingStats] = React.useState(true);

  React.useEffect(() => {
    const loadDashboard = async () => {
      setLoadingStats(true);
      try {
        await refreshComplaints();
        const response = await api.get('/dashboard/summary');
        if (response.data && response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Dashboard statistics loading failed", err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadDashboard();
  }, []);

  // Statistics Mapping from backend
  const total = stats.total;
  const pending = stats.pending;
  const inProgress = stats.inProgress;
  const resolved = stats.resolved;
  const categoryCounts = stats.byCategory;

  const categories = [
    { name: "Open Manholes", color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    { name: "Broken/Faulty Street Lights", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    { name: "Garbage Dumps", color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { name: "Potholes / Broken Roads", color: "bg-red-500", text: "text-red-600 dark:text-red-400" }
  ];

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Civic Response Dashboard
          </h1>
          <p className="text-brand-100 text-sm mt-1 max-w-xl">
            Welcome to the ICRS Portal. Report infrastructure issues directly to local authorities and monitor resolution status in real-time.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="secondary"
            icon={FiPlus}
            onClick={() => navigate('/report')}
            className="w-full sm:w-auto bg-white text-brand-700 hover:bg-slate-50 font-bold"
          >
            Report Issue
          </Button>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total complaints */}
        <Card className="flex items-center gap-4 hoverEffect border-l-4 border-l-brand-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400">
            <FiTrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Reports</p>
            <h4 className="text-2xl font-black text-slate-805 dark:text-white mt-0.5">{total}</h4>
          </div>
        </Card>

        {/* Pending */}
        <Card className="flex items-center gap-4 hoverEffect border-l-4 border-l-amber-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-450">
            <FiAlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending</p>
            <h4 className="text-2xl font-black text-slate-805 dark:text-white mt-0.5">{pending}</h4>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="flex items-center gap-4 hoverEffect border-l-4 border-l-blue-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-450">
            <FiClock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">In Progress</p>
            <h4 className="text-2xl font-black text-slate-805 dark:text-white mt-0.5">{inProgress}</h4>
          </div>
        </Card>

        {/* Resolved */}
        <Card className="flex items-center gap-4 hoverEffect border-l-4 border-l-green-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-450">
            <FiCheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resolved</p>
            <h4 className="text-2xl font-black text-slate-805 dark:text-white mt-0.5">{resolved}</h4>
          </div>
        </Card>
      </div>

      {/* Main Split Layout: Charts & Timeline Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Breakdown Card */}
        <Card title="Issue Distribution" subtitle="Reports by civic categories" className="lg:col-span-1 flex flex-col justify-between">
          <div className="flex justify-center py-4">
            {/* SVG Pie Chart */}
            <svg width="150" height="150" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-slate-800" />
              {/* Calculate dynamic circle percentages */}
              {(() => {
                let cumulativePercent = 0;
                return categories.map((cat) => {
                  const count = categoryCounts[cat.name] || 0;
                  if (count === 0 || total === 0) return null;
                  const percent = (count / total) * 100;
                  const dashArray = `${percent} ${100 - percent}`;
                  const dashOffset = 100 - cumulativePercent;
                  cumulativePercent += percent;

                  let strokeColor = "#16a34a"; // emerald
                  if (cat.name === "Open Manholes") strokeColor = "#a855f7"; // purple
                  if (cat.name === "Broken/Faulty Street Lights") strokeColor = "#f59e0b"; // amber
                  if (cat.name === "Potholes / Broken Roads") strokeColor = "#ef4444"; // red

                  return (
                    <circle
                      key={cat.name}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="3.2"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-500"
                    />
                  );
                });
              })()}
            </svg>
          </div>

          <div className="space-y-3 mt-4">
            {categories.map(cat => {
              const count = categoryCounts[cat.name] || 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat.name} className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350">
                      <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                      {cat.name}
                    </span>
                    <span className="text-slate-800 dark:text-slate-100">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className={`${cat.color} h-1.5 rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity Timeline Feed */}
        <Card
          title="Recent Reports Feed"
          subtitle="Latest updates from civic lines"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/complaints')}>
              View All
            </Button>
          }
          className="lg:col-span-2"
        >
          {recentComplaints.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <FiAlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No complaints reported yet. Click "Report Issue" to submit your first case.</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="relative group cursor-pointer" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                  {/* Timeline dot marker */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500 group-hover:scale-120 transition duration-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  </span>
                  
                  {/* Timeline Card content */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 dark:border-slate-800/60 dark:hover:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs transition duration-200">
                    <div className="flex gap-3">
                      {/* Image Thumbnail */}
                      <img
                        src={complaint.imageUrl}
                        alt={complaint.title}
                        className="h-12 w-12 rounded-lg object-cover bg-slate-100"
                      />
                      <div>
                        <h5 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-brand-500 transition duration-150">
                          {complaint.title}
                        </h5>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {complaint.location} &bull; {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
