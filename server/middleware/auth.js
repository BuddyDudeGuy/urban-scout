// middleware to check if someone is logged in and what role they have
// we attach these to routes that need protection

// checks if there's an active session with a user logged in
function requireUser(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'You need to be logged in as a user' });
  }
  next();
}

// checks if there's an active session with an admin logged in
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'You need to be logged in as an admin' });
  }
  next();
}

module.exports = { requireUser, requireAdmin };
