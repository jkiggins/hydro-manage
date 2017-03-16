var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');

var mongo = require('mongodb').MongoClient;

var assert = require('assert');

var index = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var auth = require('./routes/auth');

var app = express();

// add methods to express
app.locals.consoleLog = function (str) {
    console.log("HYDRO DEBUG " + str);
};
//-------------------------------------------------

// connect to mongodb instance
mongo.connect('mongodb://127.0.0.1:27017/hydro', function (err, db) {
    assert(err==null, err);
    console.log("connected to mongodb");
    app.locals.db = db;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cookieSession({
    name: 'session'
    ,secret: 'a7fsJ_tV'
    ,maxAge: 24 * 60 * 60 * 1000
}));

app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static('bower_components'));
app.use(express.static('public'));


// Controller
app.use('*', function (req, res, next) {
    // add hydro_ctx to request object
    req.hydro_ctx = {'error': {}, 'info': {}};
    if(req.session.hasOwnProperty('hydro_ctx'))
    {
        mergeJSON(req.hydro_ctx, req.session['hydro_ctx']);
    }

    next();
});

app.use('/test', test);
app.use('/users', users);
app.use('*', auth);
app.use('/', index);
// --


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', req.hydro_ctx);
});

module.exports = app;


function mergeJSON(merge_to, merge_from) {
    for(key in merge_from)
    {
        merge_to[key] = merge_from[key];
    }
}