'use strict'

const express = require('express')
let router = express.Router()
const lolApiController =  require('../controllers/lolApiController')

router.get('/summoner/:name', lolApiController.summoner)

module.exports = router