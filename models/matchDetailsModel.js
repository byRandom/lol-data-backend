//This file contains the data model for the match details data. It is used to store the data in the database.
let mongoose = require('mongoose')
let Schema = mongoose.Schema
let matchDetailsSchema = Schema({
    "metadata": {
        "dataVersion": {
            "type": "Date"
        },
        "matchId": {
            "type": "String"
        },
        "participants": {
            "type": [
                "String"
            ]
        }
    },
    "info": {
        "gameCreation": {
            "type": "Number"
        },
        "gameDuration": {
            "type": "Number"
        },
        "gameEndTimestamp": {
            "type": "Number"
        },
        "gameId": {
            "type": "Number"
        },
        "gameMode": {
            "type": "String"
        },
        "gameName": {
            "type": "String"
        },
        "gameStartTimestamp": {
            "type": "Number"
        },
        "gameType": {
            "type": "String"
        },
        "gameVersion": {
            "type": "String"
        },
        "mapId": {
            "type": "Number"
        },
        "participants": {
            "type": [
                "Mixed"
            ]
        },
        "platformId": {
            "type": "String"
        },
        "queueId": {
            "type": "Number"
        },
        "teams": {
            "type": [
                "Mixed"
            ]
        },
        "tournamentCode": {
            "type": "String"
        }
    },
    "__v": {
        "type": "Number"
    }
});

module.exports = mongoose.model('matchDetails', matchDetailsSchema)