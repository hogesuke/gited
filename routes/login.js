"use strict";

var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var LoginConfigration = require('../config/login-configration');

/**
 * Github OAuth.
 */
var githubStrategy = new GithubStrategy({
  clientID: LoginConfigration.Github.clientID,
  clientSecret: LoginConfigration.Github.clientSecret,
  callbackURL: LoginConfigration.Github.callbackURL
}, login);
passport.use(githubStrategy);

/**
 * OAuth login.
 */
function login(token, tokenSecret, profile, done) {
  var user = {
    id: profile.id,
    raw_name: profile.username,
    name: profile.displayName,
    provider: profile.provider,
    token: token
  }
  console.dir(user);
  done(null, user);
}

passport.serializeUser(function(user, done){
  done(null, user);
});
 
passport.deserializeUser(function(user, done){
  done(null, user);
});

/**
 * ログインチェック。
 */
exports.checkLogin = function(req, res, next) {
  if (req.session.passport.user) {
    next();
  } else {
    res.send('not yet login.');
  }
};

/**
 * ログアウトする。
 */
exports.logout = function(req, res) {
    req.logout();
    res.send('logout completed.');
};

/**
 * Strategys.
 */
exports.githubStrategy = githubStrategy;
