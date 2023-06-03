"use strict";
let axios = require("axios")
let apiKey = "RGAPI-12216380-e19e-4765-9b1d-be1e4d2b9172";
//import models
let SummonerData = require("../models/summonerDataModel");

let matchDetails = require("../models/matchDetailsModel");
// const { get } = require("../app");

const getSummoner = async (req, res) => {
    let name = req.params.name;
    let region = req.body.region;
    let url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKey}`;
    let gameVersion = await getGameVersion()
    if (region) {
        console.log(region);
    }
    if (name == null)
        return res.status(404).send({ message: "El summoner no existe" });

        let data = await axios.request({
            method:'GET',
            url: url,
        }).then(response => response.data)
        console.log(data)

    let returnData = {
        region: region,
        id: data.id,
        accountId: data.accountId,
        puuid: data.puuid,
        name: data.name,
        profileIconId: data.profileIconId,
        revisionDate: data.revisionDate,
        summonerLevel: data.summonerLevel,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${gameVersion}/img/profileicon/${data.profileIconId}.png`,
    };
    console.log(returnData);
    return returnData;
    // }catch(err){
    //     console.log(err)
    //     return {message: 'Summoner not found'}
    // }
};
const getGameVersion = async () => {
    let url = `https://ddragon.leagueoflegends.com/api/versions.json`
    let gameVersion = await axios.request({
        method:'GET',
        url: url,
    }).then(response => response.data)
    return gameVersion[0]
}
const getMatchList = async (data, start = 0, count = 20) => {
    let puuid = data.puuid
    let url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${apiKey}`
    let matchData = await axios.request({
        method:'GET',
        url: url,
    }).then(response => response.data)
    
    return matchData;
};


const getMatchDetails = async (matchId) => {
    let url = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`
    let matchDetails = await axios.request({
        method: "GET",
        url: url
    }).then(response => response.data).catch(error => console.log(error))
    return matchDetails

}

//This function will return the summoner masteries and will select the top 3 mastery champion and return the champion name and the mastery points in a json
const getSummonerMasteries = async (data) => {
    let summonerId = data.id
    let url = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${apiKey}`
    let summonerMasteries = await axios.request({
        method: "GET",
        url: url
    }).then(response => response.data).catch(error => console.log(error))
    let getChampionName = async (championId) => {
        let gameVersion = await getGameVersion()
        let url = `http://ddragon.leagueoflegends.com/cdn/${gameVersion}/data/en_US/champion.json`
        let championData = await axios.request({
            method: "GET",
            url: url
        }).then(response => response.data).catch(error => console.log(error))
        let championName = Object.keys(championData.data).find(key => championData.data[key].key == championId)
        return championName
    }

    let top3Masteries = []
    for (let i = 0; i < 3; i++) {
        top3Masteries.push(summonerMasteries[i])
    }
    let championMasteries = []
    for (let i = 0; i < 3; i++) {
        let championId = top3Masteries[i].championId
        let championMasteryPoints = top3Masteries[i].championPoints
        let championName = await getChampionName(championId)
        championMasteries.push({ championName, championMasteryPoints })
    }
    return championMasteries
}

//this function will return the winrate on the last 20 games for this summoner
const getSummonerWinrate = async (data) => {
    let summonerId = data.id
    let url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`
    let summonerLeague = await axios.request({
        method: "GET",
        url: url
    }).then(response => response.data).catch(error => console.log(error))
    let summonerWinrate = summonerLeague[0].wins / (summonerLeague[0].wins + summonerLeague[0].losses)
    return summonerWinrate
}


//this function will return the summoner MMR
const getSummonerMMR = async (data) => {
    let summonerId = data.id
    let url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`
    let summonerLeague = await axios.request({
        method: "GET",
        url: url
    }).then(response => response.data).catch(error => console.log(error))
    let summonerMMR = summonerLeague[0].leaguePoints
    return summonerMMR
}


//This function will save every match data into the database getting it from de API
let saveMatchDetails = async (matchId) => {
    let matchDetailsDB = await getMatchDetails(matchId)
    //await 1 second to not get rate limited
    await new Promise(resolve => setTimeout(resolve, 5000));
    let matchDetailsData = new matchDetails()
    matchDetailsData.metadata = matchDetailsDB.metadata
    matchDetailsData.info = matchDetailsDB.info
    matchDetailsData.matchId = matchDetailsDB.metadata.matchId
    matchDetailsData.save((err, matchDetailsStored) => {
        if (err) return { message: 'Error al guardar el matchDetails en la base de datos' }
        if (!matchDetailsStored) return { message: 'No se ha podido guardar el matchDetails en la base de datos' }
        return { matchDetails: matchDetailsStored }
    })
}
//This function will return every match data from the last games from the database
const getMatchDetailsFromDatabase = async (matchId) => {
    try {
      const matchDetailsStored = await matchDetails.findOne({ "metadata.matchId": matchId }).exec();
      if (!matchDetailsStored) {
        return { message: 'No hay datos para devolver' };
      }
      return { matchDetails: matchDetailsStored };
    } catch (error) {
      return { message: 'Error al devolver los datos', error };
    }
  };
  

//This function will check if the matchID is already in the database and if its in the database it will return true
const checkMatchDetailsInDatabase = async (matchId) => {
    console.log(matchId);
    try {
      const matchDetailsStored = await matchDetails.findOne({ "metadata.matchId": matchId }).exec();
      if (!matchDetailsStored) {
        console.log({ message: 'No se encontraron detalles del partido.' });
        return false;
      }
      console.log('Detalles del partido encontrados:', matchDetailsStored);
      return true;
    } catch (error) {
      console.log({ message: 'Error al devolver los datos:', error });
      return false;
    }
  };
  

let controller = {
    summoner: async function (req, res) {
        try {
            return res.status(200).send(await getSummoner(req, res));
        } catch (err) {
            console.log(err)
            return res.status(404).send({ message: "Summoner not found" });
        }
    },
    //this function will send the matchListData to the front
    matchList: async function (req, res) {
        try {
            let data = await getSummoner(req, res);
            let summonerMasteries = await getSummonerMasteries(data)
            let summonerWinrate = await getSummonerWinrate(data)
            let summonerMMR = await getSummonerMMR(data)
            let matchListData = await getMatchList(data)
            return res.status(200).send({ matchListData });
        } catch (err) {
            console.log(err);
            return res.status(404).send({ message: "Summoner not found" });
        }
    },
    //this function will send the matchDetails to the front
    matchDetails: async function (req, res) {
        try {
            let matchId = req.params.matchId
            let matchDetails = await getMatchDetails(matchId)
            return res.status(200).send({ matchDetails });
        } catch (err) {
            console.log(err);
            return res.status(404).send({ message: "Match not found" });
        }
    },
    matchListDetails: async function (req, res) {
        try {
            let data = await getSummoner(req, res);
            let matchListData = await getMatchList(data)
            let matchListDetails = []
            for (let i = 0; i < matchListData.length; i++) {
                let matchInDB = await checkMatchDetailsInDatabase(matchListData[i])
                console.log(matchInDB)
                if(!matchInDB){
                let matchData = await getMatchDetails(matchListData[i])
                matchListDetails.push(matchData)
                saveMatchDetails(matchListData[i])
                }else{
                    let matchDetailsData = await getMatchDetailsFromDatabase(matchListData[i])
                    matchListDetails.push(matchDetailsData)
                    
                }
            }
            return res.status(200).send({ matchListDetails });
        } catch (err) {
            console.log(err);
            return res.status(404).send({ message: "Match not found" });
        }
    },
    
    championMasteries: async function (req, res) {
        try {
            let data = await getSummoner(req, res);
            let summonerMasteries = await getSummonerMasteries(data)
            return res.status(200).send({ summonerMasteries });
        } catch (err) {
            console.log(err);
            return res.status(404).send({ message: "Summoner not found" });
        }
    }
};

module.exports = controller;
