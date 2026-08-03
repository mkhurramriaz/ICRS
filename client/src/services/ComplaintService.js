// Simulated delay to test loading states and skeleton screen effects
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const ComplaintService = {
  /**
   * Fetches all complaints from the local state storage.
   */
  async getComplaints() {
    await delay(800);
    const saved = localStorage.getItem('icrs_complaints');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  },

  /**
   * Fetches a single complaint by its unique identifier.
   */
  async getComplaintById(id) {
    await delay(400);
    const saved = localStorage.getItem('icrs_complaints');
    if (saved) {
      const complaints = JSON.parse(saved);
      return complaints.find((c) => c.id === id) || null;
    }
    return null;
  },

  /**
   * Simulates sending complaint details to the server.
   */
  async createComplaint(complaintData) {
    await delay(1200);
    // When the Express backend is ready, this will be:
    // const response = await axios.post('/api/complaints', complaintData);
    // return response.data;
    return { success: true, data: complaintData };
  },

  /**
   * Simulates updating the status of a civic report.
   */
  async updateComplaintStatus(id, status) {
    await delay(600);
    // When the Express backend is ready, this will be:
    // const response = await axios.patch(`/api/complaints/${id}`, { status });
    // return response.data;
    return { success: true, id, status };
  }
};
