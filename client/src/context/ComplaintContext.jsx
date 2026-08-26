import { createContext, useState, useEffect, useContext } from 'react';
import { ComplaintService } from '../services/ComplaintService';

const ComplaintContext = createContext();

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Expose a method to reload complaints from backend
  const refreshComplaints = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setComplaints([]);
      return;
    }
    setLoading(true);
    try {
      const data = await ComplaintService.getComplaints();
      setComplaints(data);
    } catch (e) {
      console.error('Failed to load complaints from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch complaints on context mount (if authenticated)
  useEffect(() => {
    refreshComplaints();
  }, []);

  // Method to append a new complaint locally after backend creation
  const addComplaint = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  // Method to update complaint status locally after backend change
  const updateComplaintStatus = (id, status) => {
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );
  };

  const getComplaintById = (id) => {
    return complaints.find((complaint) => complaint.id === id);
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        loading,
        addComplaint,
        updateComplaintStatus,
        getComplaintById,
        refreshComplaints
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};
