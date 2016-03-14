var express = require('express');
var router = express.Router();

/* GET test page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});


/* GET register page. */
router.route("/register").get(function(req,res){    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("register",{title:'User register'});
}).post(function(req,res){ 
     //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    var User = global.dbHandel.getModel('user');
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    User.findOne({name: uname},function(err,doc){   // 同理 /login 路径的处理方式
        if(err){ 
            res.send(500);
            console.log(err);
        }else if(doc){ 
            res.send(500);
        }else{ 
            User.create({                             // 创建一组user对象置入model
                name: uname,
                password: upwd
            },function(err,doc){ 
                 if (err) {
                        res.send(500);
                        console.log(err);
                    } else {
                        res.send(200);
                    }
                  });
        }
    });
});


router.route("/chat").get(function(req,res){ 
	//res.render("chat",{name:"Vince"});
	res.render("chat",{color:"rgb(185, 133, 173)"});

});

/* GET login page. */
router.route("/login").get(function(req,res){ //if get, return the title
    res.render("login",{title:'User Login'});
}).post(function(req,res){
    var User = global.dbHandel.getModel('user');  
    var uname = req.body.uname;
    User.findOne({name:uname},function(err,doc){
        if(err){        
            res.send(500);
            console.log(err);
        }else if(!doc){
            req.session.error = 'not exist';
            res.send(404);
        //    res.redirect("/login");
        }else{ 
            if(req.body.upwd != doc.password){   
                req.session.error = "wrong psw";
                res.send(404);
            //    res.redirect("/login");
            }else{                              
                req.session.user = doc;
                res.send(200);
            //    res.redirect("/home");
            }
        }
    });
});


module.exports = router;
