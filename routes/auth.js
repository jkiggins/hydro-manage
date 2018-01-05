var express = require('express');
var router = express.Router();


router.all("*", function (req, res, next) {
    if(req.session.hasOwnProperty('hydro-user')) {
        req.app.locals.consoleLog("User is logged in");
        req.hydro_ctx['user'] = req.session['hydro-user'];
        next();
    }
    else
    {
        req.app.locals.consoleLog("User not logged in");
        if((req.method == 'GET') && (req.originalUrl.indexOf('.') == -1))
            req.session['post_login_url'] = req.originalUrl;
            req.app.locals.consoleLog("Original url: " + req.originalUrl);

        res.redirect('/users/login');
    }
});

module.exports = router;
