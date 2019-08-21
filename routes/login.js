const passport = require('passport')
const GithubStrategy = require('passport-github').Strategy
const LoginConfigration = require('../config/login-configuration')

/**
 * Github OAuth.
 */
const githubStrategy = new GithubStrategy({
  clientID: LoginConfigration.Github.clientID,
  clientSecret: LoginConfigration.Github.clientSecret,
  callbackURL: LoginConfigration.Github.callbackURL
}, login)
passport.use(githubStrategy)

/**
 * OAuth login.
 */
function login (token, tokenSecret, profile, done) {
  const user = {
    raw_name: profile.username,
    token: token,
    type: 'loginUser'
  }
  console.dir(user)
  done(null, user)
}

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

/**
 * ログインチェック。
 */
exports.checkLogin = (req, res, next) => {
  if (req.session.passport.user) {
    next()
  } else {
    const user = {
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
exports.logout = (req, res) => {
  req.logout()
  res.redirect('/')
}

/**
 * Strategys.
 */
exports.githubStrategy = githubStrategy
