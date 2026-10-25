const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Load environment variables (from server root .env)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./Config/db');
const errorMiddleware = require('./Middlewares/errorMiddleware');

const authRoutes = require('./Routes/authRoutes');
const complaintRoutes = require('./Routes/complaintRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');
const departmentRoutes = require('./Routes/departmentRoutes');

const Department = require('./Models/Department');

const app = express();

// Define the 4 exact required municipal departments
const REQUIRED_DEPARTMENTS = [
  {
    name: 'Manhole & Drainage Department',
    code: 'MANHOLE_DRAINAGE',
    issueTypes: ['OPEN_MANHOLE'],
    isActive: true
  },
  {
    name: 'Solid Waste Management Department',
    code: 'SOLID_WASTE',
    issueTypes: ['GARBAGE_DUMP'],
    isActive: true
  },
  {
    name: 'Street Lighting Department',
    code: 'STREET_LIGHTING',
    issueTypes: ['BROKEN_STREET_LIGHT'],
    isActive: true
  },
  {
    name: 'Roads & Infrastructure Department',
    code: 'ROADS_INFRASTRUCTURE',
    issueTypes: ['POTHOLE'],
    isActive: true
  }
];

// Seed & sync default departments (runs after DB is connected)
const seedDepartments = async () => {
  try {
    // Migration mapping for any legacy seeded department codes
    const legacyCodeMap = {
      'SEWERAGE_MUNICIPAL': 'MANHOLE_DRAINAGE',
      'WASTE_MANAGEMENT': 'SOLID_WASTE',
      'ROAD_MAINTENANCE': 'ROADS_INFRASTRUCTURE'
    };

    for (const [oldCode, newCode] of Object.entries(legacyCodeMap)) {
      const oldDept = await Department.findOne({ code: oldCode });
      if (oldDept) {
        const targetConfig = REQUIRED_DEPARTMENTS.find(d => d.code === newCode);
        if (targetConfig) {
          oldDept.name = targetConfig.name;
          oldDept.code = targetConfig.code;
          oldDept.issueTypes = targetConfig.issueTypes;
          oldDept.isActive = true;
          await oldDept.save();
        }
      }
    }

    // Upsert all required departments idempotently to prevent duplicates
    for (const dept of REQUIRED_DEPARTMENTS) {
      await Department.findOneAndUpdate(
        { code: dept.code },
        { $set: dept },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log('Departments verified and synchronized successfully.');
  } catch (error) {
    console.error('Error seeding departments:', error);
  }
};

// Configure Security & Core Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded images in browser from external origins (frontend)
}));

// Configure CORS specifically for React local dev server (default port 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  console.log(`[MONGO STATE] ${require('mongoose').connection.readyState}`);
  next();
});

// Serve Uploads folder statically
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Intelligent Civic Response System API is online and healthy.',
    timestamp: new Date()
  });
});

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);

// Catch 404 Route Errors
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Centralized Error Handler Middleware (registered last)
app.use(errorMiddleware);

// Sequential startup: connect → seed → listen
(async () => {
  await connectDB();
  await seedDepartments();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`ICRS server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
})();

module.exports = app; // export for testing
