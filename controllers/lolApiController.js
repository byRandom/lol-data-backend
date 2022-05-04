"use strict";
let axios = require("axios")

let apiKey = "RGAPI-6a655b30-bfc8-4e4f-b5cd-930269e1b9ad";


const getSummoner = async (req, res) => {
    let name = req.params.name;
    let region = req.body.region;
    let url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKey}`;

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
        imageUrl: `http://ddragon.leagueoflegends.com/cdn/12.7.1/img/profileicon/${data.profileIconId}.png`,
    };
    console.log(returnData);
    return returnData;
    // }catch(err){
    //     console.log(err)
    //     return {message: 'Summoner not found'}
    // }
};

const getMatchList = async (data, start = 0, count = 20) => {
    let puuid = data.puuid
    let url = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${apiKey}`
    let matchData = await axios.request({
        method:'GET',
        url: url,
    }).then(response => response.data)
    console.log(matchData)
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

let controller = {
    summoner: async function (req, res) {
        try {
            return res.status(200).send(await getSummoner(req, res));
        } catch (err) {
            console.log(err)
            return res.status(404).send({ message: "Summoner not found" });
        }
    },

    matchList: async function (req, res) {
        try {
            let data = await getSummoner(req, res);
            let matchListData = await getMatchList(data)
            return res.status(200).send({ matchListData });
        } catch (err) {
            console.log(err);
            return res.status(404).send({ message: "Summoner not found" });
        }
    },
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
};

module.exports = controller;
