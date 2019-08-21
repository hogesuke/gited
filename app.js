const express = require('express')
const http = require('http')
const path = require('path')
const passport = require('passport')
const routes = require('./routes')
const login = require('./routes/login')

const app = express()

// all environments
app.set('port', process.env.PORT || 3001)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(express.cookieParser())
app.use(express.session({ secret: 'testtesttest' }))
app.use(passport.initialize())
app.use(passport.session())
// app.use(app.router)
app.use(express.static(path.join(__dirname, 'www')))

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler())
}

app.get('/', login.checkLogin, routes.index)
app.get('/commits', login.checkLogin, routes.commits)
app.get('/repos', login.checkLogin, routes.repos)
app.post('/login/github', passport.authenticate('github'))
app.get('/login/github/callback',
  passport.authenticate('github', { failureRedirect: '/fail' }),
  (req, res) => {
    const loginUser = req.session.passport.user
    res.redirect('/')
  }
)
app.post('/logout', login.logout)

http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'))
})
