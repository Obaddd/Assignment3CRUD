// middlewares/auth.js
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.redirect('/login'); // Redirect to login if session is missing
    }
    next();
}
  
module.exports = { requireAuth };