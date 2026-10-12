const crypto = require('crypto');

function getTokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || '';
}

function sign(payload) {
  return crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest('base64url');
}

function authenticateAdmin(req, res, next) {
  const secret = getTokenSecret();
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (!secret) {
    return res.status(503).json({
      success: false,
      message: 'Admin authentication is not configured on the backend.'
    });
  }

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Admin login required.' });
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return res.status(401).json({ success: false, message: 'Invalid admin session.' });
  }

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return res.status(401).json({ success: false, message: 'Invalid admin session.' });
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (session.expiresAt <= Date.now()) {
      return res.status(401).json({ success: false, message: 'Admin session expired.' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid admin session.' });
  }

  next();
}

function createAdminToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + 2 * 60 * 60 * 1000
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

module.exports = {
  authenticateAdmin,
  createAdminToken
};
