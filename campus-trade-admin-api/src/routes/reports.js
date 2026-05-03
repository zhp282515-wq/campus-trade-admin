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

function buildReportWhere(query) {
  const keyword = (query.keyword || '').trim();
  const status = query.status;

  const whereList = [];
  const params = [];

  // Search by goods name, reporter name, or report reason.
  if (keyword) {
    whereList.push(
      '(COALESCE(g.name, r.goods_name) LIKE ? OR r.reporter_name LIKE ? OR r.reason LIKE ?)'
    );
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  // Filter by report handling status.
  if (status) {
    whereList.push('r.status = ?');
    params.push(status);
  }

  return {
    whereSql: whereList.length ? `WHERE ${whereList.join(' AND ')}` : '',
    params
  };
}

function reportSelectSql(whereSql = '') {
  return `
    SELECT
      r.id,
      r.goods_id AS goodsId,
      COALESCE(g.name, r.goods_name) AS goodsName,
      r.reporter_name AS reporterName,
      r.reason,
      r.status,
      DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
    FROM reports r
    LEFT JOIN goods g ON r.goods_id = g.id
    ${whereSql}
  `;
}

async function getReportById(id) {
  const [rows] = await pool.query(`${reportSelectSql('WHERE r.id = ?')} LIMIT 1`, [id]);
  return rows[0];
}

router.get('/', async (req, res) => {
  try {
    const { pageSize, offset } = getPageParams(req.query);
    const { whereSql, params } = buildReportWhere(req.query);

    // Count total rows first for pagination.
    const countSql = `
      SELECT COUNT(*) AS total
      FROM reports r
      LEFT JOIN goods g ON r.goods_id = g.id
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, params);

    // Query current page report records.
    const listSql = `
      ${reportSelectSql(whereSql)}
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(listSql, [...params, pageSize, offset]);

    return success(res, {
      list: rows,
      total: countRows[0].total
    });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return fail(res, '举报列表查询失败');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const report = await getReportById(id);

    if (!report) {
      return fail(res, '举报记录不存在', 404);
    }

    return success(res, report);
  } catch (error) {
    console.error('GET /api/reports/:id error:', error);
    return fail(res, '举报详情查询失败');
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!status) {
      return fail(res, '处理状态不能为空', 400);
    }

    // The report page only changes audit status.
    const [result] = await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return fail(res, '举报记录不存在', 404);
    }

    const report = await getReportById(id);

    return success(res, report);
  } catch (error) {
    console.error('PUT /api/reports/:id/status error:', error);
    return fail(res, '修改举报状态失败');
  }
});

module.exports = router;
