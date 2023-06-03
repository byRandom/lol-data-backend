//This file contains the data model for the match list data. It is used to store the data in the database.
let mongoose = require('mongoose')
let Schema = mongoose.Schema
let matchListSchema = Schema({
    metadata: Object,
    info: Object,
    matchId: String,
} ); 

module.exports = mongoose.model('matchList', matchListSchema)