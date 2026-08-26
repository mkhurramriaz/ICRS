import api from './api';

/**
 * Converts a base64 DataURL string to a standard File object.
 */
const dataURLtoFile = (dataurl, filename) => {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error('Error converting base64 data to File object:', error);
    return null;
  }
};

export const ComplaintService = {
  /**
   * Fetches all complaints from the backend database.
   */
  async getComplaints() {
    try {
      const response = await api.get('/complaints');
      return response.data.data; // Array of serialized complaints
    } catch (error) {
      console.error('Error getting complaints feed:', error);
      return [];
    }
  },

  /**
   * Fetches a single complaint by its unique identifier.
   */
  async getComplaintById(id) {
    try {
      const response = await api.get(`/complaints/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error getting complaint ${id}:`, error);
      return null;
    }
  },

  /**
   * Sends complaint details to the server (supports multipart image uploads).
   */
  async createComplaint(complaintData) {
    try {
      const formData = new FormData();
      formData.append('title', complaintData.title);
      formData.append('description', complaintData.description);
      formData.append('category', complaintData.category);
      formData.append('location', complaintData.location);
      
      // Send coordinate values
      formData.append('latitude', complaintData.latitude || 33.6844);
      formData.append('longitude', complaintData.longitude || 73.0479);

      if (complaintData.imageUrl) {
        if (complaintData.imageUrl.startsWith('data:image/')) {
          // Convert base64 DataURL back to a File
          const file = dataURLtoFile(complaintData.imageUrl, 'complaint-image.jpg');
          if (file) {
            formData.append('image', file);
          }
        } else {
          formData.append('image', complaintData.imageUrl);
        }
      }

      const response = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data; // { success: true, data: ... }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to submit complaint.';
      throw new Error(errorMsg);
    }
  },

  /**
   * Updates the status of a civic report.
   */
  async updateComplaintStatus(id, status) {
    try {
      const response = await api.patch(`/complaints/${id}/status`, { status });
      return response.data; // { success: true, data: ... }
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to update status.';
      throw new Error(errorMsg);
    }
  }
};
