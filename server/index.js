var express = require('express')
var fs = require('fs')
var path = require('path')
var bole = require('bole')
var bodyParser = require('body-parser')
var uuid = require('node-uuid')
var crypto = require('crypto')
var cookieParser = require('cookie-parser')
var mustache = require('mustache')

bole.output({
  level: 'debug',
  stream: process.stdout
})

var log = bole('dw')

var app = express()
app.use(function (req, res, next) {
  log.debug(req.method + ' ' + req.url)
  next()
})
app.use(bodyParser.urlencoded())
app.use(cookieParser('7b27c532-869c-41ba-9c38-b62374dc8cfb'))

/* Begin temporary database */
/* This will be replaced later by an actual datastore */
var userPath = path.join(__dirname, 'users.json')
var writingUsers = false

var Users = {}

try {
  Users = JSON.parse(fs.readFileSync(userPath))
} catch (e) {}

/* Persist Users */
setInterval(function () {
  if (writingUsers) return null
  writingUsers = true
  log.debug('Writing users.json')
  fs.writeFile(userPath, JSON.stringify(Users), function () {
    log.debug('Finished writing users.json')
    writingUsers = false
  })
}, 10000)

/* End database */

/* Handle user creation and login */
app.post('/register', function register (req, res) {
  var username = req.body.username
  var password = req.body.password

  if (Users[username]) return res.redirect('/register.html').end()

  var salt = uuid.v4()
  var hash = crypto.createHmac('sha512', 'df6351b9-2adc-4562-b8a6-271aca39be37')
    .update(password + '' + salt)
    .digest('base64')
  Users[username] = {
    username: username,
    salt: salt,
    hash: hash
  }

  return res.redirect('/login.html').end()
})

app.use(function (req, res, next) {
  var session = req.cookies['session']

  for (var user in Users) {
    if (Users[user].session === session) {
      req.user = Users[user]
      return next()
    }
  }

  return res.redirect('/login.html').end()
})

app.post('/login', function login (req, res) {
  var username = req.body.username
  var password = req.body.password

  if (!Users[username]) {
    return res.redirect('/login.html').end()
  }

  var hash = crypto.createHmac('sha512', 'df6351b9-2adc-4562-b8a6-271aca39be37')
    .update(password + '' + Users[username].salt)
    .digest('base64')

  if (Users[username].hash !== hash) {
    return res.redirect('/login.html').end()
  }

  Users[username].session = uuid.v4()
  res.cookie('session', Users[username].session).redirect('/').end()
})

/* Manage projects */
app.post('/project/new', function (req, res) {
  if (!req.user) {
    return res.end()
  }
  var name = req.body.name
  var torrent_hash = req.body.torrent_hash

  if (!Users[req.user.username].Projects) {
    Users[req.user.username].Projects = {}
  }

  Users[req.user.username].Projects[name] = {
    name: name,
    torrent_hash: torrent_hash
  }

  return res.redirect('/projects.html')
})

app.get('/projects', function (req, res) {
  fs.readFile(path.join(__dirname, 'static', 'projects.html'), 'utf-8', function (e, template) {
    if (e) return res.status(500).end(e)

    var projects = []
    for (var project in req.user.Projects) {
      projects.push(req.user.Projects[project])
    }

    var output = mustache.render(template, { 'projects': projects })
    return res.status(200).send(output)
  })
})

/* Serve static files */
app.use(express.static(path.join(__dirname, 'static')))

/* Start app */
app.listen('8080', function (e) {
  if (e) return log.error(e)
  log.info('Listening on :8080')
})
