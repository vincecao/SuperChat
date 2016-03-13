var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});


router.route("/register").get(function(req,res){    
	res.render("register",{title:'User register'});
});


router.route("/chat").get(function(req,res){ 
	res.render("chat",{title:'chat'});
});


module.exports = router;
