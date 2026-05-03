const express = require('express');
const pool = require('../config/db');
const { success, fail } = require('../utils/response');

const router = express.Router();

function getPageParams(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.max(Number(query.pageSize) || 10, 1);
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

function buildOrderWhere(query) {
  const keyword = (query.keyword || '').trim();
  const status = query.status;

  const whereList = [];
  const params = [];

  // Search by order number or goods name.
  if (keyword) {
    whereList.push(
      '(o.order_no LIKE ? OR COALESCE(g.name, o.goods_name) LIKE ? OR o.buyer_name LIKE ? OR o.seller_name LIKE ?)'
    );
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  // Filter by order status.
  if (status) {
    whereList.push('o.status = ?');
    params.push(status);
  }

  return {
    whereSql: whereList.length ? `WHERE ${whereList.join(' AND ')}` : '',
    params
  };
}

function orderSelectSql(whereSql = '') {
  return `
    SELECT
      o.id,
      o.order_no AS orderNo,
      o.goods_id AS goodsId,
      COALESCE(g.name, o.goods_name) AS goodsName,
      o.buyer_name AS buyerName,
      o.seller_name AS sellerName,
      o.amount AS amount,
      o.status,
      DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
    FROM \`orders\` o
    LEFT JOIN goods g ON o.goods_id = g.id
    ${whereSql}
  `;
}

function formatOrder(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    amount: Number(row.amount)
  };
}

async function getOrderById(id) {
  const [rows] = await pool.query(`${orderSelectSql('WHERE o.id = ?')} LIMIT 1`, [id]);
  return formatOrder(rows[0]);
}

router.get('/', async (req, res) => {
  try {
    const { pageSize, offset } = getPageParams(req.query);
    const { whereSql, params } = buildOrderWhere(req.query);

    // Count total rows first for pagination.
    const countSql = `
      SELECT COUNT(*) AS total
      FROM \`orders\` o
      LEFT JOIN goods g ON o.goods_id = g.id
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, params);

    // Query current page data.
    const listSql = `
      ${orderSelectSql(whereSql)}
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(listSql, [...params, pageSize, offset]);

    return success(res, {
      list: rows.map(formatOrder),
      total: countRows[0].total
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return fail(res, '订单列表查询失败');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await getOrderById(id);

    if (!order) {
      return fail(res, '订单不存在', 404);
    }

    return success(res, order);
  } catch (error) {
    console.error('GET /api/orders/:id error:', error);
    return fail(res, '订单详情查询失败');
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!status) {
      return fail(res, '订单状态不能为空', 400);
    }

    // The order page only needs status updates for now.
    const [result] = await pool.query('UPDATE `orders` SET status = ? WHERE id = ?', [
      status,
      id
    ]);

    if (result.affectedRows === 0) {
      return fail(res, '订单不存在', 404);
    }

    const order = await getOrderById(id);

    return success(res, order);
  } catch (error) {
    console.error('PUT /api/orders/:id/status error:', error);
    return fail(res, '修改订单状态失败');
  }
});

module.exports = router;
