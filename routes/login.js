'use strict';

var passport = require('passport')
var GithubStrategy = require('passport-github').Strategy
var LoginConfigration = require('../config/login-configuration')

/**
 * Github OAuth.
 */
var githubStrategy = new GithubStrategy({
  clientID: LoginConfigration.Github.clientID,
  clientSecret: LoginConfigration.Github.clientSecret,
  callbackURL: LoginConfigration.Github.callbackURL
}, login)
passport.use(githubStrategy)

/**
 * OAuth login.
 */
function login (token, tokenSecret, profile, done) {
  var user = {
    raw_name: profile.username,
    token: token,
    type: 'loginUser'
  }
  console.dir(user)
  done(null, user)
}

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

/**
 * ログインチェック。
 */
exports.checkLogin = function (req, res, next) {
  if (req.session.passport.user) {
    next()
  } else {
    var user = {
      raw_name: LoginConfigration.tryUser.raw_name,
      token: LoginConfigration.tryUser.token,
      type: 'tryUser'
    }
    req.session.passport.user = user
    next()
  }
}

/**
 * ログアウトする。
 */
exports.logout = function (req, res) {
  req.logout()
    res.redirect('/')
};

/**
 * Strategys.
 */
exports.githubStrategy = githubStrategy
