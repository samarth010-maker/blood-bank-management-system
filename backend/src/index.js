const express = require ('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const {authenticate , authorize} = require('./middleware/authMiddleware');
const inventoryRoutes = require('./routes/inventoryRoutes');
const donationRoutes = require('./routes/donationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const auditRoutes = require('./routes/auditRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const app = express();


app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.json({ message: 'Blood Bank API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.get('/api/protected-test', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

app.get('/api/admin-only-test', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Welcome, admin!', user: req.user });
});

app.get('/api/donor-only-test', authenticate, authorize('DONOR'), (req, res) => {
  res.json({ message: 'Welcome, donor!', user: req.user });
});



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
