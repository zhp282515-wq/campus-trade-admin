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

function buildUserWhere(query) {
  const keyword = (query.keyword || '').trim();
  const college = query.college;
  const status = query.status;

  const whereList = [];
  const params = [];

  // Search by user id, student number, real name, or phone number.
  if (keyword) {
    whereList.push(
      '(CAST(s.id AS CHAR) LIKE ? OR s.username LIKE ? OR s.nickname LIKE ? OR s.phone LIKE ?)'
    );
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  // Filter by college.
  if (college) {
    whereList.push('s.college = ?');
    params.push(college);
  }

  // Filter by user status.
  if (status) {
    whereList.push('s.status = ?');
    params.push(status);
  }

  return {
    whereSql: whereList.length ? `WHERE ${whereList.join(' AND ')}` : '',
    params
  };
}

function userSelectSql(whereSql = '') {
  return `
    SELECT
      s.id,
      s.username,
      s.nickname,
      s.phone,
      s.college,
      s.status,
      COUNT(g.id) AS goodsCount,
      DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
    FROM students s
    LEFT JOIN goods g ON g.seller_id = s.id
    ${whereSql}
    GROUP BY s.id
  `;
}

async function getUserById(id) {
  const [rows] = await pool.query(`${userSelectSql('WHERE s.id = ?')} LIMIT 1`, [id]);
  return rows[0];
}

router.get('/', async (req, res) => {
  try {
    const { pageSize, offset } = getPageParams(req.query);
    const { whereSql, params } = buildUserWhere(req.query);

    // Count users first for the front-end pagination component.
    const countSql = `
      SELECT COUNT(*) AS total
      FROM students s
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, params);

    // Query current page users. Goods count is calculated from goods table.
    const listSql = `
      ${userSelectSql(whereSql)}
      ORDER BY s.created_at DESC, s.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(listSql, [...params, pageSize, offset]);

    return success(res, {
      list: rows,
      total: countRows[0].total
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return fail(res, '用户列表查询失败');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await getUserById(id);

    if (!user) {
      return fail(res, '用户不存在', 404);
    }

    return success(res, user);
  } catch (error) {
    console.error('GET /api/users/:id error:', error);
    return fail(res, '用户详情查询失败');
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!status) {
      return fail(res, '用户状态不能为空', 400);
    }

    // Only update the status field used by the user management page.
    const [result] = await pool.query('UPDATE students SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return fail(res, '用户不存在', 404);
    }

    const user = await getUserById(id);

    return success(res, user);
  } catch (error) {
    console.error('PUT /api/users/:id/status error:', error);
    return fail(res, '修改用户状态失败');
  }
});

module.exports = router;
