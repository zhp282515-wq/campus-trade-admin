const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const { fail } = require('./utils/response');
const authRoutes = require('./routes/auth');
const goodsRoutes = require('./routes/goods');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const collegesRoutes = require('./routes/colleges');
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Campus Trade Admin API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api', (req, res) => {
  return fail(res, '接口不存在', 404);
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Campus Trade Admin API is running at http://localhost:${port}`);
});
