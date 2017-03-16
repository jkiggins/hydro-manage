var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.hydro_ctx['Title'] = "Test Page";
    req.hydro_ctx['user'] = {'username': "jkiggins", 'first_name': "Jacob", 'last_name': "Kiggins"};
    res.render('test', req.hydro_ctx);
});

module.exports = router;
