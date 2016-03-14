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
	//res.render("chat",{name:"Vince"});
	res.render("chat",{color:"rgb(185, 133, 173)", name: 'Vince'});

});


module.exports = router;
