var express = require('express');
var router = express.Router();

var bcrypt = require('bcrypt');

// account managment
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
////////////////////////////////////////////////////

// New user routes
router.all('/create', function (req, res, next) {
    req.hydro_ctx['Title'] = 'Create User';
    req.hydro_ctx['error']['user'] = {};
    next();
});

router.get('/create', function (req, res, next) {
    res.render('create_user', req.hydro_ctx);
});

router.post('/create', function (req, res, next) {

    if (!Object.prototype.hasOwnProperty.call(req.body, 'username') || req.body['username'] == '') {
        req.hydro_ctx['error']['user']['password'] = "You must enter a username";
    }
    else if (!Object.prototype.hasOwnProperty.call(req.body, 'password') || req.body['password'] == '') {
        req.hydro_ctx['error']['user']['password'] = "You must enter a password";
    }
    else if (!Object.prototype.hasOwnProperty.call(req.body, 'password_confirm') || req.body['password_confirm'] == '') {
        req.hydro_ctx['error']['user']['password_confirm'] = "You must confirm your password";
    }
    else if (req.body['password'] != req.body['password_confirm']) {
        req.hydro_ctx['error']['user']['password_confirm'] = "You must confirm your password";
    }
    else
    {
        req.app.locals.consoleLog('called user collection');
        req.app.locals.db.collection('users', usersCollectionCB);
        return;
    }

    res.render('create_user', req.hydro_ctx);

    function usersCollectionCB(err, col)
    {
        if(err == null)
        {
            req.app.locals.consoleLog("called user exists");
            col.findOne({'username': req.body['username']}, userExistsCBWrap(col));
        }
        else
        {
            userCreationErr(err);
        }
    }

    function userExistsCBWrap(col) {
        return function userExistsCB(err, item) {
            if (err == null) {
                if (item == null) {
                    req.app.locals.consoleLog("user doesn't exists yet");
                    bcrypt.hash(req.body['password'], 5, function (err, hash_pass) {
                        if (err == null) {
                            col.insert({
                                'username': req.body['username'],
                                'password': hash_pass,
                                'active': false
                            }, {w: 1}, insertCB);
                            req.app.locals.consoleLog("called insert");
                        }
                        else {
                            req.hydro_ctx['error']['main'] = err;
                            res.render('create_user', req.hydro_ctx);
                        }
                    });
                } else {
                    req.hydro_ctx['error']['user']['username'] = "Username Taken";
                    res.render('create_user', req.hydro_ctx);
                }

            } else {
                userCreationErr(err);
            }

        }
    }

    function insertCB(err, result)
    {
        if(err != null)
        {
            userCreationErr(err);
        }
        else
        {
            res.redirect('/users/login');
            req.app.locals.consoleLog('insert sucsessful: ' + result);
        }
    }

    function userCreationErr(err) {
        console.error(err);
        req.hydro_ctx['error']['main'] = err;
        res.render('create_user', req.hydro_ctx);
    }
});
//////////////////////////////////////////////////////


/*Login Routes */
router.all('/login', function loginAll (req, res, next) {

    if(req.session.hasOwnProperty('hydro-user'))
    {
        res.redirect('/');
    }

    req.hydro_ctx['Title'] = "Login";
    req.hydro_ctx['error']['user'] = {};
    next();
});

router.get('/login', function loginGet(req, res, next) {
    req.app.locals.consoleLog("rendering login");
    res.render('login', req.hydro_ctx);
});

router.post('/login', function (req, res, next) {

    if(!Object.prototype.hasOwnProperty.call(req.body, 'username') || req.body.username == '')
    {
        req.hydro_ctx['error']['user']['password'] = "You must enter a username";
    }
    else if(!Object.prototype.hasOwnProperty.call(req.body, 'password') || req.body.password == '')
    {
        req.hydro_ctx['error']['user']['password'] = "You must enter a password";
    }
    else
    {
        return req.app.locals.db.collection('users', userCollectionCB);
    }

    res.render('login', req.hydro_ctx);


    function userCollectionCB(err, col)
    {
        if(err == null)
        {
            // find user by username
            col.findOne({'username': req.body['username']}, findUserCB);
        }
        else
        {
            req.hydro_ctx['error']['main'] = err;
            res.render('login', req.hydro_ctx);
        }
    }

    function findUserCB(err, item) {
        if (err == null) {
            if (item == null) {
                req.hydro_ctx['error']['user']['username'] = "Invalid Username";
            }
            else if (!item['active']){
                req.hydro_ctx['error']['main'] = "User not Active";
            }
            else{
                req.app.locals.consoleLog("calling bcrypt compare");
                return bcrypt.compare(req.body['password'], item['password'], bcryptCompareCBWrap(item));
            }
        } else {
            req.hydro_ctx['error']['main'] = err;
        }

        res.render('login', req.hydro_ctx);
    }

    function bcryptCompareCBWrap(item) {
        return function bcryptCompareCB(err, match) {
            if(err == null) {
                req.app.locals.consoleLog("no bcrypt compare error");
                if(match) {
                    req.app.locals.consoleLog("bcrypt matched password");
                    // set session variable for user, remove
                    delete item['password'];
                    req.session['hydro-user'] = item;

                    if(req.session.hasOwnProperty('post_login_url')) {
                        req.app.locals.consoleLog("post_login_url exists: " + req.session['post_login_url']);
                        res.redirect(req.session['post_login_url']);
                    }
                    else{
                        res.redirect('/');
                    }
                    return;
                }else{
                    req.hydro_ctx['error']['user']['password'] = "Invalid Password";
                    res.render('login', req.hydro_ctx);
                }
            }else {
                req.hydro_ctx['error']['main'] = err;
            }
            req.app.locals.consoleLog("some error happened");
            res.render('login', req.hydro_ctx);
        }
    }
});
/////////////////////////////////////////////////////////

/*Logout Route*/
router.all('/logout', function (req, res, next) {
   delete req.session['hydro-user'];
   res.redirect('/users/login');
});
/////////////////////////////////////////////////////////

// exports
module.exports = router;



