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

function buildGoodsWhere(query) {
  const keyword = (query.keyword || '').trim();
  const categoryId = query.categoryId;
  const status = query.status;

  const whereList = [];
  const params = [];

  // Search by goods name or goods id.
  if (keyword) {
    whereList.push('(g.name LIKE ? OR CAST(g.id AS CHAR) LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  // Filter by category id.
  if (categoryId) {
    whereList.push('g.category_id = ?');
    params.push(Number(categoryId));
  }

  // Filter by goods status.
  if (status) {
    whereList.push('g.status = ?');
    params.push(status);
  }

  return {
    whereSql: whereList.length ? `WHERE ${whereList.join(' AND ')}` : '',
    params
  };
}

function goodsSelectSql(whereSql = '') {
  return `
    SELECT
      g.id,
      g.name,
      g.category_id AS categoryId,
      COALESCE(c.name, g.category_name) AS categoryName,
      g.price + 0 AS price,
      g.seller_id AS sellerId,
      COALESCE(s.nickname, g.seller_name) AS sellerName,
      COALESCE(s.college, g.college) AS college,
      g.status,
      g.views,
      g.description,
      DATE_FORMAT(g.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
    FROM goods g
    LEFT JOIN categories c ON g.category_id = c.id
    LEFT JOIN students s ON g.seller_id = s.id
    ${whereSql}
  `;
}

function formatGoods(row) {
  if (!row) {
    return row;
  }

  return {
    ...row,
    price: Number(row.price)
  };
}

async function getCategoryName(categoryId, fallbackName) {
  if (!categoryId) {
    return fallbackName || '';
  }

  // Read category name from database, with request body value as fallback.
  const [rows] = await pool.query('SELECT name FROM categories WHERE id = ?', [categoryId]);
  return rows.length ? rows[0].name : fallbackName || '';
}

async function getGoodsById(id) {
  const [rows] = await pool.query(`${goodsSelectSql('WHERE g.id = ?')} LIMIT 1`, [id]);
  return formatGoods(rows[0]);
}

router.get('/', async (req, res) => {
  try {
    const { pageSize, offset } = getPageParams(req.query);
    const { whereSql, params } = buildGoodsWhere(req.query);

    // Count total rows first, so the front-end pagination can work.
    const countSql = `
      SELECT COUNT(*) AS total
      FROM goods g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN students s ON g.seller_id = s.id
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, params);

    // Query current page data with category and seller information.
    const listSql = `
      ${goodsSelectSql(whereSql)}
      ORDER BY g.created_at DESC, g.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(listSql, [...params, pageSize, offset]);

    return success(res, {
      list: rows.map(formatGoods),
      total: countRows[0].total
    });
  } catch (error) {
    console.error('GET /api/goods error:', error);
    return fail(res, '商品列表查询失败');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const goods = await getGoodsById(id);

    if (!goods) {
      return fail(res, '商品不存在', 404);
    }

    return success(res, goods);
  } catch (error) {
    console.error('GET /api/goods/:id error:', error);
    return fail(res, '商品详情查询失败');
  }
});

router.post('/', async (req, res) => {
  try {
    // Read the same fields used by GoodsList.vue form.
    const name = (req.body.name || '').trim();
    const categoryId = Number(req.body.categoryId) || null;
    const categoryName = await getCategoryName(categoryId, req.body.categoryName);
    const price = Number(req.body.price) || 0;
    const sellerId = Number(req.body.sellerId) || null;
    const sellerName = (req.body.sellerName || '').trim();
    const college = (req.body.college || '').trim();
    const status = req.body.status || '待审核';
    const views = Number(req.body.views) || 0;
    const description = (req.body.description || '').trim();

    if (!name) {
      return fail(res, '商品名称不能为空', 400);
    }

    // Use parameterized SQL to insert data safely.
    const insertSql = `
      INSERT INTO goods
        (name, category_id, category_name, price, seller_id, seller_name, college, status, views, description, created_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(insertSql, [
      name,
      categoryId,
      categoryName,
      price,
      sellerId,
      sellerName,
      college,
      status,
      views,
      description
    ]);

    const goods = await getGoodsById(result.insertId);

    return success(res, goods);
  } catch (error) {
    console.error('POST /api/goods error:', error);
    return fail(res, '新增商品失败');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = (req.body.name || '').trim();
    const categoryId = Number(req.body.categoryId) || null;
    const categoryName = await getCategoryName(categoryId, req.body.categoryName);
    const price = Number(req.body.price) || 0;
    const sellerId = Number(req.body.sellerId) || null;
    const sellerName = (req.body.sellerName || '').trim();
    const college = (req.body.college || '').trim();
    const status = req.body.status || '待审核';
    const views = Number(req.body.views) || 0;
    const description = (req.body.description || '').trim();

    if (!name) {
      return fail(res, '商品名称不能为空', 400);
    }

    // Update all editable fields from the front-end form.
    const updateSql = `
      UPDATE goods
      SET
        name = ?,
        category_id = ?,
        category_name = ?,
        price = ?,
        seller_id = ?,
        seller_name = ?,
        college = ?,
        status = ?,
        views = ?,
        description = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(updateSql, [
      name,
      categoryId,
      categoryName,
      price,
      sellerId,
      sellerName,
      college,
      status,
      views,
      description,
      id
    ]);

    if (result.affectedRows === 0) {
      return fail(res, '商品不存在', 404);
    }

    const goods = await getGoodsById(id);

    return success(res, goods);
  } catch (error) {
    console.error('PUT /api/goods/:id error:', error);
    return fail(res, '编辑商品失败');
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!status) {
      return fail(res, '商品状态不能为空', 400);
    }

    // Status update is separated because the table has a quick status action.
    const [result] = await pool.query('UPDATE goods SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return fail(res, '商品不存在', 404);
    }

    const goods = await getGoodsById(id);

    return success(res, goods);
  } catch (error) {
    console.error('PUT /api/goods/:id/status error:', error);
    return fail(res, '修改商品状态失败');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const goods = await getGoodsById(id);

    if (!goods) {
      return fail(res, '商品不存在', 404);
    }

    // Delete the goods row from MySQL.
    await pool.query('DELETE FROM goods WHERE id = ?', [id]);

    return success(res, goods);
  } catch (error) {
    console.error('DELETE /api/goods/:id error:', error);
    return fail(res, '删除商品失败');
  }
});

module.exports = router;
