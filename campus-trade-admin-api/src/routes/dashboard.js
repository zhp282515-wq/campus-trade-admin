const express = require('express');
const pool = require('../config/db');
const { success, fail } = require('../utils/response');

const router = express.Router();

// Demo mode:
// Seed data is fixed and not created every real day. When this is true, the
// dashboard treats the latest order date as "today", so cards and charts still
// show useful demo data. For real production use, change this to false and the
// API will use MySQL CURDATE() as the real current date.
const USE_LATEST_ORDER_DATE_AS_TODAY = true;
const GOODS_STATUS_PENDING_AUDIT = '\u5f85\u5ba1\u6838';

function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00`);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toMonthDay(dateText) {
  return dateText.slice(5);
}

function formatDateValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildSevenDayTrend(endDate, rows) {
  const countMap = new Map(rows.map((item) => [item.day, item.count]));

  // Build a complete 7-day array, so days without orders show as 0.
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(endDate, index - 6);

    return {
      date: toMonthDay(day),
      count: countMap.get(day) || 0
    };
  });
}

async function getCurrentDateFromMysql() {
  const [rows] = await pool.query('SELECT CURDATE() AS baseDate');
  return formatDateValue(rows[0].baseDate);
}

async function getDashboardBaseDate() {
  if (!USE_LATEST_ORDER_DATE_AS_TODAY) {
    return getCurrentDateFromMysql();
  }

  // In demo mode, use the latest order date as the dashboard base date.
  // This keeps "today orders" and the 7-day trend visible when seed data is old.
  const [rows] = await pool.query('SELECT MAX(DATE(created_at)) AS baseDate FROM `orders`');
  const latestOrderDate = formatDateValue(rows[0].baseDate);

  // If the orders table is empty, fall back to MySQL CURDATE() and return 0s.
  return latestOrderDate || getCurrentDateFromMysql();
}

router.get('/', async (req, res) => {
  try {
    const baseDate = await getDashboardBaseDate();

    const [
      [userRows],
      [goodsRows],
      [todayOrderRows],
      [pendingAuditRows],
      [trendRows],
      [categoryRows],
      [collegeRows],
      [statusRows]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM students'),
      pool.query('SELECT COUNT(*) AS total FROM goods'),
      pool.query('SELECT COUNT(*) AS total FROM `orders` WHERE DATE(created_at) = ?', [baseDate]),
      pool.query('SELECT COUNT(*) AS total FROM goods WHERE status = ?', [GOODS_STATUS_PENDING_AUDIT]),
      pool.query(
        `
          SELECT
            DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
            COUNT(*) AS count
          FROM \`orders\`
          WHERE DATE(created_at) BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?
          GROUP BY day
          ORDER BY day ASC
        `,
        [baseDate, baseDate]
      ),
      pool.query(
        `
          SELECT
            c.name,
            COUNT(g.id) AS value
          FROM categories c
          LEFT JOIN goods g ON g.category_id = c.id
          GROUP BY c.id, c.name, c.sort
          ORDER BY value DESC, c.sort ASC
        `
      ),
      pool.query(
        `
          SELECT
            college AS name,
            COUNT(*) AS value
          FROM goods
          WHERE college IS NOT NULL AND college <> ''
          GROUP BY college
          ORDER BY value DESC, college ASC
          LIMIT 10
        `
      ),
      pool.query(
        `
          SELECT
            status AS name,
            COUNT(*) AS value
          FROM goods
          GROUP BY status
          ORDER BY value DESC, status ASC
        `
      )
    ]);

    return success(res, {
      totalUsers: userRows[0].total,
      totalGoods: goodsRows[0].total,
      todayOrders: todayOrderRows[0].total,
      pendingAudit: pendingAuditRows[0].total,
      orderTrend: buildSevenDayTrend(baseDate, trendRows),
      categoryStats: categoryRows,
      collegeStats: collegeRows,
      goodsStatusStats: statusRows
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return fail(res, '\u6570\u636e\u770b\u677f\u67e5\u8be2\u5931\u8d25');
  }
});

module.exports = router;
