const theInternet = require('request-promise-native');
const uuid = require('uuid/v4');
const models = require("../models");
const cheerio = require('cheerio');

async function synchronizeCoins(){
    console.log("Synchronizing coins");

    let coins = await getCoins();

    await updateCoins(coins);

    console.log("Done Synchronizing coins");
}

async function getCoins(){
    const url = `https://bittrex.com/api/v1.1/public/getcurrencies`;
    
    const options = {
        uri: url,
        json: true
    };

    let data = null;
    try{
        data = await theInternet(options);
    }catch(Error){}

    if(data === null || data === undefined || data.result === null || data.result === undefined){
        throw new Error('Could not get coins.');
    }

    return data.result;
}

async function updateCoins(coins){
    for(let coin of coins){
        if(coin.CoinType === "ETH_CONTRACT"){
            let existing = await models.Coin.findOne({
                where: {
                  code: coin.Currency
                }
              });

            if(existing === null){
                var baseAddress = '';
                try{
                    let page = await theInternet({
                        uri: `https://etherscan.io/token/${coin.CurrencyLong}`
                    });

                    $ = cheerio.load(page);
                    
                    baseAddress = $("#ContentPlaceHolder1_trContract td a").text();
                }catch(Err){
                    console.log("could not get base address for "+coin.Currency);
                }


                // Not found: importing
                await models.Coin.create({
                    code: coin.Currency,
                    description: coin.CurrencyLong,
                    isActive: coin.IsActive,
                    coinType: coin.CoinType,
                    baseAddress: baseAddress
                });
            }
        }
    }
}

module.exports = synchronizeCoins;