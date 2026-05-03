const express = require('express');
const pool = require('../config/db');
const { success, fail } = require('../utils/response');

const router = express.Router();

function createToken(user) {
  // Simple demo token for this student project. It is enough for local testing.
  // A real production project should replace this with JWT or session auth.
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    time: Date.now()
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function parseToken(token) {
  try {
    const text = Buffer.from(token, 'base64url').toString('utf8');
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function getTokenFromRequest(req) {
  const authorization = req.headers.authorization || '';

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return req.headers['x-token'] || '';
}

function formatUser(row, token) {
  return {
    token,
    username: row.username,
    nickname: row.nickname,
    role: row.role
  };
}

router.post('/login', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const password = req.body.password || '';

    if (!username || !password) {
      return fail(res, '\u8bf7\u8f93\u5165\u7528\u6237\u540d\u548c\u5bc6\u7801', 400);
    }

    // Query admin user by username and password. SQL parameters avoid injection.
    const [rows] = await pool.query(
      `
        SELECT id, username, nickname, role
        FROM admin_users
        WHERE username = ? AND password = ?
        LIMIT 1
      `,
      [username, password]
    );

    if (rows.length === 0) {
      return fail(res, '\u7528\u6237\u540d\u6216\u5bc6\u7801\u9519\u8bef', 401);
    }

    const token = createToken(rows[0]);

    return success(res, formatUser(rows[0], token));
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return fail(res, '\u767b\u5f55\u5931\u8d25');
  }
});

router.get('/profile', async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const payload = parseToken(token);

    if (!payload?.id) {
      return fail(res, '\u8bf7\u5148\u767b\u5f55', 401);
    }

    // Read the latest user information from MySQL by token user id.
    const [rows] = await pool.query(
      `
        SELECT id, username, nickname, role
        FROM admin_users
        WHERE id = ?
        LIMIT 1
      `,
      [payload.id]
    );

    if (rows.length === 0) {
      return fail(res, '\u767b\u5f55\u4fe1\u606f\u5df2\u5931\u6548', 401);
    }

    return success(res, formatUser(rows[0], token));
  } catch (error) {
    console.error('GET /api/auth/profile error:', error);
    return fail(res, '\u83b7\u53d6\u7528\u6237\u4fe1\u606f\u5931\u8d25');
  }
});

module.exports = router;
