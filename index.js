const express = require('express');
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

db.sync()
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

app.use('/', userRoutes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});