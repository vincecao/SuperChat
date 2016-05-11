/*
Module Dependencies
*/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    hash = require('./pass').hash;
    //googleTranslate = require('google-translate')("AIzaSyDLYBE-s5itd-S3ts-ngRubBHnShHE1sns");

var googleTranslate = require('google-translate')("AIzaSyDLYBE-s5itd-S3ts-ngRubBHnShHE1sns");

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var id = 0;
var name;
var WholePassword;
var WholeUserid;
var mongodbUri = 'mongodb://localhost:27017/nodedb';

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        googleTranslate.detectLanguage(msg, function(err, detection) {
            console.log(detection.language);
            //console.log(true);
            // if(detection.language == 'es'){
            // io.emit('chat message', msg);
            // }else
            if(detection.language != 'en'){
            io.emit('chat message', msg);
                googleTranslate.translate(msg, '' , 'en', function(err, translation) {
            io.emit('chat message', translation.translatedText + '(English)');
            });
        }else{
            io.emit('chat message', msg);
        };
        });
    });
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});

mongoose.connect(mongodbUri);
var UserSchema = new mongoose.Schema({
    id: Number,
    username: String,
    password: String,
    //color: String,
    salt: String,
    hash: String
});

var User = mongoose.model('users', UserSchema);
/*
Middlewares and configurations
*/
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser('Authentication Tutorial '));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', __dirname + '/views');
    app.engine("html",require("ejs").__express);
    app.set('view engine', 'html');
    //app.set('view engine', 'ejs')
    //app.set('view engine', 'jade');
});

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = err;
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
/*
Helper Functions
*/
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('%s have loged in, its password is %s', name, pass);

    User.findOne({
        username: name
    },

    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        } else {
            return fn(new Error('cannot find user'));
        }
    });

}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExist(req, res, next) {
  if (req.body.password != "" || req.body.username != "" )
  {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            res.redirect("/signup");
            req.session.error = "User Exist";
            // function myFunction() {
            //   alert("I am an alert box!");
            // }
            // document.write ("This is a warning message!");
        }
    });
  }else{
    res.redirect("/signup");
    req.session.error = "username and password can not be empty";
  }
}

function nonemptyinLogin(req, res, next) {
  if (req.body.password != "" || req.body.username != "" )
  {
    next();
  }else{
    res.redirect("/login");
    req.session.error = "username and password can not be empty";
  }
}

/*
Routes
*/
app.get("/", function (req, res) {

    if (req.session.user) {
        var userstring = "";
        User.find(function (err, users){
            if (err) return console.error(err);
                function FetchUsername(input, field) {
                    var output = ["sad","a","sda"];
                    for (var i=0; i < input.length ; ++i)
                        output.push(input[i][field]);
                    return output;
            }
            var userlist = FetchUsername(users, "username");
            userstring = userlist.join("-");
            console.log(typeof userstring);
            //res.send("Welcome " + req.session.user.username + "<br>" +"The id is " + WholeUserid + "<br>" +"The password is " + WholePassword + "<br>" + "users has registered: <br>" + userstring + "<br>" + "<a href='/logout'>logout</a>" + "<br>" + "<a href='/chat'>Chatting Page</a>");
            res.render("home",{name:req.session.user.username, WholePassword: WholePassword, userstring: userlist});
            });
                sessionName = req.session.user.username;
    } else {
        res.redirect("/login");
    }
});

app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup", {title:'User register'});
    }
});

app.get("/home", function (req, res) {
    if (req.session.user) {
        res.render("home");
    } else {
        res.redirect("/");
    }
});

app.get("/login", function (req, res) {
    res.render("login", {title:'User Login', message: req.session.error});
});

app.post("/signup", userExist, function (req, res) {

  var password = req.body.password;
  WholePassword = req.body.password;
  var username = req.body.username;

  hash(password, function (err, salt, hash) {
    if (err) throw err;
    id++;
    var user = new User({
      id: id,
      username: username,
      salt: salt,
      hash: hash,
    });

    //try to print and see it
    console.log(user);

    user.save(function (err, newUser) {
      if (err) throw err;
      authenticate(newUser.username, password, function (err, user){
        if(user){
          req.session.regenerate(function(){
            req.session.user = user;
            //req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now can chat <a href="/restricted">/restricted</a>.';
            res.redirect('/');
          });
        }
      });
    });
  });
});

app.post("/login", nonemptyinLogin, function (req, res) {
  WholePassword = req.body.password;
  authenticate(req.body.username, req.body.password, function (err, user) {
    if (user) {
      req.session.regenerate(function () {
        req.session.user = user;
        //req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('/');
      });
      } else {
        req.session.error = 'Authentication failed, please check your ' + ' username and password.';
        res.redirect('/login');
      }
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/chat', requiredAuthentication, function(req,res){

    //res.render("chat",{name:"Vince"});
    res.render("chat",{color:"#FFF", name: sessionName});
});
