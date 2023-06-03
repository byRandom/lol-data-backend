//This file contains the data model for the summoner data. It is used to store the data in the database.

let  mongoose = require('mongoose')
let Schema = mongoose.Schema
let summonerDataSchema = Schema({
    summonerName: String,
    summonerId: String,
    summonerLevel: Number,
    profileIconId: Number,
    puuid: String,
    accountId: String,
    region: String,
    imageUrl: String,
    revisionDate: Number,
    matchList: Array,
    matchDetails: Array,
    summonerMasteries: Array,
    summonerRank: Array,
    summonerMatches: Array,
    summonerMatchesDetails: Array,
    summonerMatchesTimeline: Array,
    summonerMatchesTimelineFrames: Array,
    summonerMatchesTimelineFramesEvents: Array,
    summonerMatchesTimelineFramesEventsPosition: Array,
    summonerMatchesTimelineFramesEventsVictimDamageDealt: Array,
} );

module.exports = mongoose.model('summonerData', summonerDataSchema)
