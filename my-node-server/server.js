const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path'); // Added path

const app = express();
const port = 3001;

const authRoutes = require('./routes/auth');
const presensiRoutes = require('./routes/presensi');
const reportRoutes = require('./routes/reports');

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Konfigurasi Folder Statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('Server Presensi Berjalan!');
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}/`);
});
