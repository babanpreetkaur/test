const body_parser = require('body-parser')
const cors = require('cors')
const crypto = require('crypto')
const express = require('express')
const express_winston = require('express-winston')
const helmet = require('helmet')
const mongoose = require('mongoose')
const winston = require('winston')

const app = express()

/* enable security headers */
app.use(helmet())

/* enable cors */
app.use(cors({
  origin: /(localhost|127\.0\.0\.1)/,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

/* enable body parser for two encoding methods */
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())

/* Overall global winston logger instance */
app.locals.logger = new winston.Logger({
  transports: [
    new winston.transports.Console({ colorize: true, timestamp: true })
  ]
})

/* Enable express-winston middleware through global winston logger instance */
app.use(express_winston.logger({
  winstonInstance: app.locals.logger
}))

/* Setup database connect and models */
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/restful-collection')
const DartPlayer = mongoose.model('DartPlayer', {
  name: String,
  email: String,
  score: Number,
  age: Number
})

app.get('/random', (req, res, next) => {
  return res.type('application/json').send({
    status: 'success',
    data: crypto.randomBytes(1)[0]
  })
})

app.get('/players', (req, res, next) => {
  DartPlayer.find({}, (err, players) => {
    if (err) {
      return res.status(500).type('application/json').send({
        status: 'error',
        data: err
      })
    } else {
      return res.type('application/json').send({
        status: 'success',
        data: players
      })
    }
  })
})

app.get('/players/:id', (req, res, next) => {
  DartPlayer.findOne({ _id: req.params.id }, (err, player) => {
    if (err) {
      return res.status(500).type('application/json').send({
        status: 'error',
        data: err
      })
    } else {
      return res.type('application/json').send({
        status: 'success',
        data: player
      })
    }
  })
})

app.post('/players', (req, res, next) => {
  const player = new DartPlayer(req.body)
  player.save((err) => {
    if (err) {
      return res.status(500).type('application/json').send({
        status: 'error',
        data: err
      })
    } else {
      return res.type('application/json').send({
        status: 'success',
        data: player
      })
    }
  })
})

/* update an existing instance */
app.put('/players/:id', (req, res, next) => {
  DartPlayer.findOneAndUpdate({ _id: req.params.id }, { '$set': req.body }, (err, player) => {
    if (err) {
      return res.status(500).type('application/json').send({
        status: 'error',
        data: err
      })
    } else {
      return res.type('application/json').send({
        status: 'success',
        data: player
      })
    }
  })
})

/* delete an existing instance */
app.delete('/players/:id', (req, res, next) => {
  DartPlayer.findOneAndRemove({ _id: req.params.id }, (err) => {
    if (err) {
      return res.status(500).type('application/json').send({
        status: 'error',
        data: err
      })
    } else {
      return res.type('application/json').send({
        status: 'success',
        data: 'object deleted'
      })
    }
  })
})

app.listen(3000, () => {
  app.locals.logger.info('App started at http://whatever:3000/')
})
