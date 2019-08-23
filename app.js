const express = require('express')
const http = require('http')
const path = require('path')
const passport = require('passport')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const logger = require('morgan')
const methodOverride = require('method-override')
const serveStatic = require('serve-static')
const errorHandler = require('errorhandler')
const routes = require('./routes')
const login = require('./routes/login')

const app = express()

// all environments
app.set('port', process.env.PORT || 3001)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded())
app.use(passport.initialize())
app.use(passport.session())
app.use(logger('dev'))
app.use(methodOverride())
app.use(serveStatic(path.join(__dirname, 'www')))
app.use(favicon(path.join(__dirname, 'www/img/', 'favicon.ico')))
app.use(cookieParser())
app.use(session({ secret: 'testtesttest' }))

// development only
if (app.get('env') === 'development') {
  app.use(errorHandler())
}

app.get('/', login.checkLogin, routes.index)
app.get('/commits', login.checkLogin, routes.commits)
app.get('/repos', login.checkLogin, routes.repos)
app.post('/login/github', passport.authenticate('github'))
app.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/fail' }),
  (req, res) => {
    res.redirect('/')
  }
)
app.post('/logout', login.logout)

http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'))
})
