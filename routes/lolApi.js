'use strict'

const express = require('express')
let router = express.Router()
const lolApiController = require('../controllers/lolApiController')

router.get('/summoner/:name', lolApiController.summoner)
router.get('/match-list/:name', lolApiController.matchList)
router.get('/match-details/:matchId',lolApiController.matchDetails)
router.get('/championMasteries/:name',lolApiController.championMasteries)
router.get('/match-list-details/:name/:start/:amount',lolApiController.matchListDetails)

module.exports = router