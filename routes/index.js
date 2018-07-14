const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function(app, db) {

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    };

    router.get('/', function(req, res) {
		res.sendFile('index.html', { root:  'public' });
	});

    app.route('/login')
        .post(passport.authenticate('local', {
            failureRedirect: '/'
        }), (req, res) => {
            res.redirect('/profile');
        });

    app.route('/profile')
        .get(ensureAuthenticated, (req, res) => {
            res.render(process.cwd() + '/views/pug/profile', {
                username: req.user.username
            });
        });

    app.route('/register')
        .post((req, res, next) => {
                var hash = bcrypt.hashSync(req.body.password, 8);
                db.collection('users').findOne({
                    username: req.body.username
                }, function(err, user) {
                    if (err) {
                        next(err);
                    } else if (user) {
                        res.redirect('/');
                    } else {
                        db.collection('users').insertOne({
                                username: req.body.username,
                                password: hash
                            },
                            (err, doc) => {
                                if (err) {
                                    res.redirect('/');
                                } else {
                                    next(null, user);
                                }
                            }
                        )
                    }
                })
            },
            passport.authenticate('local', {
                failureRedirect: '/'
            }),
            (req, res, next) => {
                res.redirect('/profile');
            }
        );

    app.route('/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/');
        });

    app.use((req, res, next) => {
        res.status(404)
            .type('text')
            .send('Not Found');
    });

}
