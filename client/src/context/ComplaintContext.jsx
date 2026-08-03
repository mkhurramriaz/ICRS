import { createContext, useState, useEffect, useContext } from 'react';
import { mockComplaints } from '../data/mockComplaints';

const ComplaintContext = createContext();

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('icrs_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load complaints from localStorage", e);
      }
    }
    return mockComplaints;
  });

  useEffect(() => {
    localStorage.setItem('icrs_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Method to report a new civic issue
  const addComplaint = (complaintData) => {
    const nextIdNumber = complaints.length + 1;
    const newId = `COMP-2026-${String(nextIdNumber).padStart(3, '0')}`;
    
    // Simulate initial AI classification
    const randomConfidence = (0.75 + Math.random() * 0.22).toFixed(3);
    const mockAIPredictions = {
      "Open Manholes": { prediction: "Open Manhole", detection: "Open Shaft Area" },
      "Broken/Faulty Street Lights": { prediction: "Faulty Street Light", detection: "Dark/Inactive Pole" },
      "Garbage Dumps": { prediction: "Garbage Pile", detection: "Unmanaged Refuse" },
      "Potholes / Broken Roads": { prediction: "Pothole / Fissure", detection: "Pavement Damage" }
    };

    const aiDetails = mockAIPredictions[complaintData.category] || { prediction: "Unknown", detection: "Analyzing..." };

    const newComplaint = {
      id: newId,
      title: complaintData.title,
      category: complaintData.category,
      description: complaintData.description,
      location: complaintData.location,
      imageUrl: complaintData.imageUrl || "https://images.unsplash.com/photo-1594818868299-19e485459363?auto=format&fit=crop&w=800&q=80",
      status: "pending",
      createdAt: new Date().toISOString(),
      // AI Field placeholders
      prediction: aiDetails.prediction,
      confidenceScore: parseFloat(randomConfidence),
      detectionResult: aiDetails.detection,
      verificationStatus: "Auto-Detected (Simulated)"
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  // Method to update complaint status (simulating admin resolution panel)
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
        addComplaint,
        updateComplaintStatus,
        getComplaintById,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};
