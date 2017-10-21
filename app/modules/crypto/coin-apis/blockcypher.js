const theInternet = require('request-promise-native');
const uuid = require('uuid/v4');

class BlockCypher{
    constructor(coin){
        this.coin = coin;
        this.conversionFactor = Math.pow(10, coin.decimals);
    }

    async getBalance(address){
        const url = `http://api.blockcypher.com/v1/${this.coin.code}/main/addrs/${address}`;

        const options = {
            uri: url,
            json: true
        };

        let data = null;
        try{
            data = await theInternet(options);
        }catch(Error){}

        if(data === null || data === undefined || data.balance === null || data.balance === undefined){
            throw new Error('Could not get balance.');
        }

        return data.balance / this.conversionFactor;
    }

    async getTransactions(address){    
        const url = `https://api.blockcypher.com/v1/${this.coin.code}/main/addrs/${address}/full`;
        
        const options = {
            uri: url,
            json: true
        };

        let data = null;
        
        try{
            console.log(url);
            data = await theInternet(options);
        }catch(Error){}

        if(data === null || data === undefined || data.txs === null || data.txs === undefined){
            throw new Error('Could not get transactions.');
        }

        let transactions = [];
        for(let element of data.txs){
            let formatted = this.formatResultData(element, address);
            transactions.push(formatted);
        }

        return transactions;
    }

    formatResultData(t, address){
        let transaction = {};

        transaction.id = t.hash;
        transaction.ts = new Date(t.confirmed).getTime();

        const spent = t.inputs.filter(rec => rec.addresses.indexOf(address) >= 0).map(rec => rec.output_value).reduce((prev, curr) => prev + curr, 0) / this.conversionFactor;
        const received = t.outputs.filter(rec => rec.addresses.indexOf(address) >= 0).map(rec => rec.value).reduce((prev, curr) => prev + curr, 0)/ this.conversionFactor;

        if(received > 0){
            transaction.value = received;
        }
        else{
            transaction.value = -spent;
        }

        return transaction;
    }
}

module.exports = BlockCypher;
