var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.hydro_ctx['Title'] = 'Home'
  res.render('index', req.hydro_ctx);
});


/* Scheme Rotes */

router.all('/schemes', function(req, res, next)
{
  req.hydro_ctx['Title'] = "Schemes";
  next();
});

router.get('/schemes', function (req, res, next) {
  req.hydro_ctx['schemes'] = [
      {
        'name': "Scheme1"
        ,'notes': "This Is the 1st Scheme"
        ,'toggle_points': [0, 10, 20 ,30, 70]
        ,'uses':    [
                        {'name': "cluster name1", 'url': "#"}
                        ,{'name': "cluster name2", 'url': "#"}
                    ]
      }
      ,{
          'name': "Scheme2"
          ,'notes': "This Is the 2nd Scheme"
          ,'toggle_points': [10, 20 ,30, 70]
          ,'uses':    [
              {'name': "cluster name1", 'url': "#"}
              ,{'name': "cluster name2", 'url': "#"}
          ]
      }
      ,{
          'name': "Scheme3"
          ,'notes': "This Is the 3rd Scheme"
          ,'toggle_points': [10 ,30, 70, 90]
      }
  ];

    res.render('schemes', req.hydro_ctx);
});

module.exports = router;
