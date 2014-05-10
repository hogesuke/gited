"use strict";

var express = require('express');
var http = require('http');
var path = require('path');
var passport = require('passport');
var routes = require('./routes');
var login = require('./routes/login');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'testtesttest'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/commits', routes.commits);
app.post('/login/github', passport.authenticate('github'));
app.get('/login/github/callback',
  passport.authenticate('github',{failureRedirect: '/fail'}),
  function(req, res) {
    var loginUser = req.session.passport.user;
    res.redirect('/');
  }
);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
