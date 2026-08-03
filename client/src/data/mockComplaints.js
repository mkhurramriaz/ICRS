export const mockComplaints = [
  {
    id: "COMP-2026-001",
    title: "Deep Pothole on Main Boulevard",
    category: "Potholes / Broken Roads",
    description: "There is a massive and deep pothole in the middle lane of Main Boulevard near the Central Mall. It's causing severe traffic bottlenecks and poses a high risk to motorcyclists, especially at night.",
    location: "Main Boulevard, near Central Mall, Sector G-11",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    createdAt: "2026-07-05T09:30:00Z",
    prediction: "Pothole detected",
    confidenceScore: 0.945,
    detectionResult: "Verified Pothole",
    verificationStatus: "Auto-Detected"
  },
  {
    id: "COMP-2026-002",
    title: "Overflowing Garbage Dump near Public Park",
    category: "Garbage Dumps",
    description: "The garbage bin near the Entrance of Shalimar Park has not been cleared for over a week. Trash is overflowing onto the main pavement, creating a foul odor and attracting stray dogs.",
    location: "Entrance 2, Shalimar Park Road, Block C",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
    status: "in_progress",
    createdAt: "2026-07-04T14:15:00Z",
    prediction: "Garbage Dump detected",
    confidenceScore: 0.887,
    detectionResult: "Verified Waste Area",
    verificationStatus: "Auto-Detected"
  },
  {
    id: "COMP-2026-003",
    title: "Broken Street Light in Residential Alley",
    category: "Broken/Faulty Street Lights",
    description: "Street light pole number SL-402 has been completely non-functional for three days. The entire lane is pitch dark, causing safety concerns for residents returning late from work.",
    location: "Street 14, Sector F-6/2",
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80",
    status: "resolved",
    createdAt: "2026-07-02T18:45:00Z",
    prediction: "Faulty Street Light detected",
    confidenceScore: 0.912,
    detectionResult: "Verified Light Outage",
    verificationStatus: "Auto-Detected"
  },
  {
    id: "COMP-2026-004",
    title: "Open Manhole near Bus Stop",
    category: "Open Manholes",
    description: "A manhole cover is completely missing on the sidewalk right next to the Metro Bus Stop. This is extremely dangerous for pedestrians, especially children and visually impaired individuals.",
    location: "Metro Station Exit, Jinnah Avenue",
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80",
    status: "pending",
    createdAt: "2026-07-06T08:10:00Z",
    prediction: "Open Manhole detected",
    confidenceScore: 0.978,
    detectionResult: "Verified Open Manhole",
    verificationStatus: "Auto-Detected"
  }
];

export const mockCategories = [
  "Open Manholes",
  "Broken/Faulty Street Lights",
  "Garbage Dumps",
  "Potholes / Broken Roads"
];
