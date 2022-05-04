'use strict'
// const TeemoJS = require('teemojs');
// let api = TeemoJS('RGAPI-edc4bc31-c7dd-48b5-bfb9-013adc22702d');
  let {LolApi, Constants } =  require('twisted')

const api = new LolApi({
    /**
    * If api response is 429 (rate limits) try reattempt after needed time (default true)
    */
   rateLimitRetry: true,
   /**
    * Number of time to retry after rate limit response (default 1)
    */
   rateLimitRetryAttempts: 1,
   /**
    * Concurrency calls to riot (default infinity)
    * Concurrency per method (example: summoner api, match api, etc)
    */
   concurrency: undefined,
   /**
    * Riot games api key
    */
   key: 'RGAPI-6a655b30-bfc8-4e4f-b5cd-930269e1b9ad',
   /**
    * Debug methods
    */
   debug: {
     /**
      * Log methods execution time (default false)
      */
     logTime: false,
     /**
      * Log urls (default false)
      */
     logUrls: false,
     /**
      * Log when is waiting for rate limits (default false)
      */
   }
 })



let controller = {
    summoner: async function(req, res){
        let name = req.params.name
        let region = req.body.region
        if(region){console.log(region)}
        let data
        if(name == null) return res.status(404).send({message: 'El summoner no existe'})
        try{
            
            switch(region){
                case 'EU_WEST':
                    data = await api.Summoner.getByName(`${req.params.name}`, Constants.Regions.EU_WEST)
                    break
                case 'EU_EAST':
                    data = await api.Summoner.getByName(`${req.params.name}`, Constants.Regions.EU_EAST)
                    break
                case 'KOREA':
                    data = await api.Summoner.getByName(`${req.params.name}`, Constants.Regions.KOREA)
                    break
                case 'AMERICA_NORT':
                    data = await api.Summoner.getByName(`${req.params.name}`, Constants.Regions.AMERICA_NORTH)
                    return
                case 'JAPAN':
                    data = await api.Summoner.getByName(`${req.params.name}`, Constants.Regions.JAPAN)
                    break
                default:
                    data = await api.Summoner.getByName(`${req.params.name}`, Constants.Regions.EU_WEST)
                    break
                    
                }      

            
            console.log(data.response)
            return res.status(200).send({
            id: data.response.id,
            accountId: data.response.accountId,
            puuid: data.response.puuid,
            name: data.response.name,
            profileIconId: data.response.profileIconId,
            revisionDate: data.response.revisionDate,
            summonerLevel: data.response.summonerLevel,
            imageUrl: `http://ddragon.leagueoflegends.com/cdn/12.7.1/img/profileicon/${data.response.profileIconId}.png`
        })
        }catch(err){
            console.log(err)
            return res.status(404).send({message: 'Summoner not found'})
        }
        
        
    },

}

module.exports = controller