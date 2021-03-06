var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var app = express();

var secret = "snowflakes";

var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var mongodbUri = process.env['MONGOLAB_URI'];
var mongooseUri = uriUtil.formatMongoose(mongodbUri);
mongoose.connect(mongooseUri || 'mongodb://localhost/holiday-party-items');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Item = require('./models/item');
var User = require('./models/user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/items', expressJWT({secret: secret}));
app.use('/api/users', expressJWT({secret: secret})
.unless({path: ['/api/users'], method: 'post'}));

app.use(function (err, req, res, next) {
 if (err.name === 'UnauthorizedError') {
   res.status(401).send({message: 'You need an authorization token to view this information.'})
 }
});

app.use('/api/items', require('./controllers/items'));
app.use('/api/users', require('./controllers/users'));
app.use('/api/cookietest', require('./controllers/cookietest'));
app.use('/api/drinktest', require('./controllers/drinktest'));

app.post('/api/auth', function(req, res) {
 User.findOne({email: req.body.email}, function(err, user) {
   if (err || !user) return res.send({message: 'User not found'});
   user.authenticated(req.body.password, function(err, result) {
     if (err || !result) return res.send({message: 'User not authenticated'});

     var token = jwt.sign(user, secret);
     res.send({user: user, token: token});
   });
 });
});

app.get('/*', function(req, res) {
 res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(process.env.PORT || 3000);