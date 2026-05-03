const express = require('express');
const pool = require('../config/db');
const { success, fail } = require('../utils/response');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Query category list and count related goods for display.
    const sql = `
      SELECT
        c.id,
        c.name,
        c.sort,
        c.status,
        COUNT(g.id) AS goodsCount,
        DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
      FROM categories c
      LEFT JOIN goods g ON g.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort ASC, c.id ASC
    `;

    const [rows] = await pool.query(sql);

    return success(res, rows);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return fail(res, '分类列表查询失败');
  }
});

router.post('/', async (req, res) => {
  try {
    // Read form data from request body.
    const name = (req.body.name || '').trim();
    const sort = Number(req.body.sort) || 1;

    if (!name) {
      return fail(res, '分类名称不能为空', 400);
    }

    // Use parameterized SQL to insert a new category.
    const insertSql = `
      INSERT INTO categories (name, sort, status, goods_count, created_at)
      VALUES (?, ?, '启用', 0, NOW())
    `;
    const [result] = await pool.query(insertSql, [name, sort]);

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          sort,
          status,
          goods_count AS goodsCount,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
        FROM categories
        WHERE id = ?
      `,
      [result.insertId]
    );

    return success(res, rows[0]);
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return fail(res, '新增分类失败');
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Read route id and editable fields.
    const id = Number(req.params.id);
    const name = (req.body.name || '').trim();
    const sort = Number(req.body.sort) || 1;

    if (!name) {
      return fail(res, '分类名称不能为空', 400);
    }

    // Update only the fields used by the front-end form.
    const updateSql = 'UPDATE categories SET name = ?, sort = ? WHERE id = ?';
    const [result] = await pool.query(updateSql, [name, sort, id]);

    if (result.affectedRows === 0) {
      return fail(res, '分类不存在', 404);
    }

    const [rows] = await pool.query(
      `
        SELECT
          id,
          name,
          sort,
          status,
          goods_count AS goodsCount,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
        FROM categories
        WHERE id = ?
      `,
      [id]
    );

    return success(res, rows[0]);
  } catch (error) {
    console.error('PUT /api/categories/:id error:', error);
    return fail(res, '编辑分类失败');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete by id. The current student project schema has no foreign key limit.
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT id, name FROM categories WHERE id = ?', [id]);

    if (rows.length === 0) {
      return fail(res, '分类不存在', 404);
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    return success(res, rows[0]);
  } catch (error) {
    console.error('DELETE /api/categories/:id error:', error);
    return fail(res, '删除分类失败');
  }
});

module.exports = router;
