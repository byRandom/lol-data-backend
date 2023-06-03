"use strict";
let axios = require("axios")
let apiKey = "RGAPI-12216380-e19e-4765-9b1d-be1e4d2b9172";
//import models
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
    try {
      const summonerId = data.id;
      const url = `https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}?api_key=${apiKey}`;
      const response = await axios.get(url);
      const summonerMasteries = response.data;
  
      const getChampionName = async (championId) => {
        try {
          const gameVersion = await getGameVersion();
          const url = `http://ddragon.leagueoflegends.com/cdn/${gameVersion}/data/en_US/champion.json`;
          const response = await axios.get(url);
          const championData = response.data;
          const championName = Object.keys(championData.data).find(
            (key) => championData.data[key].key == championId
          );
          return championName;
        } catch (error) {
          console.log(error);
          return null;
        }
      };
  
      const top3Masteries = summonerMasteries.slice(0, 3);
  
      const championMasteries = await Promise.all(
        top3Masteries.map(async (mastery) => {
          const championId = mastery.championId;
          const championMasteryPoints = mastery.championPoints;
          const championName = await getChampionName(championId);
          return { championName, championMasteryPoints };
        })
      );
  
      return championMasteries;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
//this function will return the winrate on the last 20 games for this summoner
const getSummonerWinrate = async (data) => {
  try {
    const summonerId = data.id;
    const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`;
    const response = await axios.get(url);
    const summonerLeague = response.data;
    const wins = summonerLeague[0].wins;
    const losses = summonerLeague[0].losses;
    const summonerWinrate = wins / (wins + losses);
    return summonerWinrate;
  } catch (error) {
    console.log(error);
    return null;
  }
};



//this function will return the summoner MMR
const getSummonerMMR = async (data) => {
    try {
      const summonerId = data.id;
      const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${apiKey}`;
      const response = await axios.get(url);
      const summonerLeague = response.data;
      return summonerLeague;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  


//This function will save every match data into the database getting it from de API
const saveMatchDetails = async (matchId) => {
    try {
      const matchDetailsDB = await getMatchDetails(matchId);
      // Esperar 1 segundo para evitar limitaciones de velocidad
      await new Promise(resolve => setTimeout(resolve, 1000));
      const matchDetailsData = new matchDetails({
        metadata: matchDetailsDB.metadata,
        info: matchDetailsDB.info,
        matchId: matchDetailsDB.metadata.matchId
      });
      const matchDetailsStored = await matchDetailsData.save();
      if (!matchDetailsStored) {
        return { message: 'No se ha podido guardar el matchDetails en la base de datos' };
      }
      return { matchDetails: matchDetailsStored };
    } catch (error) {
      return { message: 'Error al guardar el matchDetails en la base de datos', error };
    }
  };
  
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
            let summonerData = await getSummoner(req, res);
            console.log(summonerData)
            let winrate = await getSummonerWinrate(summonerData)
            winrate = Math.round(winrate * 100)
            summonerData = {...summonerData, winrate: winrate}
            let leagueData = await getSummonerMMR(summonerData)
            leagueData = leagueData[0]
            summonerData = {...summonerData, league: leagueData.tier, rank: leagueData.rank, leaguePoints: leagueData.leaguePoints, wins: leagueData.wins, losses: leagueData.losses}
            console.log(summonerData)
            
            return res.status(200).send(summonerData);
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
