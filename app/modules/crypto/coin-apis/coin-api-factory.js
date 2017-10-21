const models = require('../models');
const EtherscanApi = require('./etherscan.io');
const BlockCypher = require('./blockcypher');

class CoinApiFactory{
    async getCoinFactory(coinId){
        console.log("building coin factory");
        
        let coin = await this.getCoinOrThrow(coinId);
    
        if(coin.code === "ETH"){
            return new EtherscanApi(coin);
        }else if(["BTC", "LTC", "DOGE"].indexOf(coin.code) >= 0){
            return new BlockCypher(coin);
        }
    
        throw new Error("Coin not found.");
    }

    async getTotalCalculator(coinId){
        // Todo refine for altcoins
        let coin = await this.getCoinOrThrow(coinId);

        if(coin.code === "ETH"){
            return new EtherscanApi(coin);
        }else if(["BTC", "LTC", "DOGE"].indexOf(coin.code) >= 0){
            return new BlockCypher(coin);
        }
    
        throw new Error("Coin not found.");
    }

    async getCoinOrThrow(coinId){
        let coin = await models.Coin.findOne({
            where: {
                id: coinId
            }
        });
    
        if(coin === null){
            throw new Error("Coin not found:"+coinId);
        }

        return coin;
    }
}
module.exports = CoinApiFactory;