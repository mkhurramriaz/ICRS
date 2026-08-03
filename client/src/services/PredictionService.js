const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const PredictionService = {
  /**
   * Simulates retrieval of Computer Vision predictions.
   * AI predictions will show 'Coming Soon' or mock confidence values.
   */
  async getPredictions(complaintId) {
    await delay(1500);
    // Future work will involve communication with Express, which queries the Python microservice.
    return {
      prediction: "Coming Soon",
      confidenceScore: "Coming Soon",
      detectionResult: "Coming Soon",
      verificationStatus: "Coming Soon"
    };
  }
};
