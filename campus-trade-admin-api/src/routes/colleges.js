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

function buildCollegeWhere(query) {
  const keyword = (query.keyword || '').trim();
  const status = query.status;

  const whereList = [];
  const params = [];

  // Search by college name or college code.
  if (keyword) {
    whereList.push('(name LIKE ? OR code LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  // The goods and users pages use this to load enabled colleges for dropdowns.
  if (status) {
    whereList.push('status = ?');
    params.push(status);
  }

  return {
    whereSql: whereList.length ? `WHERE ${whereList.join(' AND ')}` : '',
    params
  };
}

function collegeSelectSql(whereSql = '') {
  return `
    SELECT
      id,
      name,
      code,
      student_count AS studentCount,
      goods_count AS goodsCount,
      sort,
      status,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
    FROM colleges
    ${whereSql}
  `;
}

async function getCollegeById(id) {
  const [rows] = await pool.query(`${collegeSelectSql('WHERE id = ?')} LIMIT 1`, [id]);
  return rows[0];
}

function buildCollegeData(body) {
  return {
    name: (body.name || '').trim(),
    code: (body.code || '').trim(),
    studentCount: Number(body.studentCount) || 0,
    goodsCount: Number(body.goodsCount) || 0,
    sort: Number(body.sort) || 1,
    status: body.status || '启用'
  };
}

function sendDuplicateError(res, error) {
  if (error.code === 'ER_DUP_ENTRY') {
    return fail(res, '学院名称或学院代码已存在', 400);
  }

  return null;
}

router.get('/', async (req, res) => {
  try {
    const hasPage = req.query.page || req.query.pageSize;
    const { whereSql, params } = buildCollegeWhere(req.query);

    // Without page params, return a plain array for dropdown options.
    if (!hasPage) {
      const [rows] = await pool.query(`${collegeSelectSql(whereSql)} ORDER BY sort ASC, id ASC`, params);

      return success(res, rows);
    }

    const { pageSize, offset } = getPageParams(req.query);

    // Count total rows first for pagination.
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM colleges ${whereSql}`,
      params
    );

    // Query current page data.
    const [rows] = await pool.query(
      `${collegeSelectSql(whereSql)} ORDER BY sort ASC, id ASC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return success(res, {
      list: rows,
      total: countRows[0].total
    });
  } catch (error) {
    console.error('GET /api/colleges error:', error);
    return fail(res, '学院列表查询失败');
  }
});

router.post('/', async (req, res) => {
  try {
    const college = buildCollegeData(req.body);

    if (!college.name || !college.code) {
      return fail(res, '学院名称和学院代码不能为空', 400);
    }

    // Insert the fields used by the college management form.
    const insertSql = `
      INSERT INTO colleges
        (name, code, student_count, goods_count, sort, status, created_at)
      VALUES
        (?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(insertSql, [
      college.name,
      college.code,
      college.studentCount,
      college.goodsCount,
      college.sort,
      college.status
    ]);

    const data = await getCollegeById(result.insertId);

    return success(res, data);
  } catch (error) {
    if (sendDuplicateError(res, error)) {
      return;
    }

    console.error('POST /api/colleges error:', error);
    return fail(res, '新增学院失败');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const college = buildCollegeData(req.body);

    if (!college.name || !college.code) {
      return fail(res, '学院名称和学院代码不能为空', 400);
    }

    // Update all editable fields from the college form.
    const updateSql = `
      UPDATE colleges
      SET
        name = ?,
        code = ?,
        student_count = ?,
        goods_count = ?,
        sort = ?,
        status = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(updateSql, [
      college.name,
      college.code,
      college.studentCount,
      college.goodsCount,
      college.sort,
      college.status,
      id
    ]);

    if (result.affectedRows === 0) {
      return fail(res, '学院不存在', 404);
    }

    const data = await getCollegeById(id);

    return success(res, data);
  } catch (error) {
    if (sendDuplicateError(res, error)) {
      return;
    }

    console.error('PUT /api/colleges/:id error:', error);
    return fail(res, '编辑学院失败');
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!status) {
      return fail(res, '学院状态不能为空', 400);
    }

    const [result] = await pool.query('UPDATE colleges SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return fail(res, '学院不存在', 404);
    }

    const data = await getCollegeById(id);

    return success(res, data);
  } catch (error) {
    console.error('PUT /api/colleges/:id/status error:', error);
    return fail(res, '修改学院状态失败');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const college = await getCollegeById(id);

    if (!college) {
      return fail(res, '学院不存在', 404);
    }

    // Do not delete colleges that are already used by students or goods.
    const [usedRows] = await pool.query(
      `
        SELECT
          (SELECT COUNT(*) FROM students WHERE college = ?) AS studentTotal,
          (SELECT COUNT(*) FROM goods WHERE college = ?) AS goodsTotal
      `,
      [college.name, college.name]
    );

    if (usedRows[0].studentTotal > 0 || usedRows[0].goodsTotal > 0) {
      return fail(res, '该学院已被用户或商品使用，暂不能删除', 400);
    }

    await pool.query('DELETE FROM colleges WHERE id = ?', [id]);

    return success(res, college);
  } catch (error) {
    console.error('DELETE /api/colleges/:id error:', error);
    return fail(res, '删除学院失败');
  }
});

module.exports = router;
