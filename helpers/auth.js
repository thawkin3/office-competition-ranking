// Helper auth method to ensure that the user is currently logged in
// If they are not logged in, redirect to the home page
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/');
};

// Helper auth method to ensure that the user is NOT currently logged in
// If they are logged in, redirect to the leaderboard page
const ensureNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/leaderboard');
};

// Helper auth method to ensure that the user is currently logged in when making API requests
// If they are not logged in, send an unauthorized error
const ensureAuthenticatedForApi = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'You are not currently logged in' });
};

module.exports = {
    ensureAuthenticated,
    ensureNotAuthenticated,
    ensureAuthenticatedForApi,
};
