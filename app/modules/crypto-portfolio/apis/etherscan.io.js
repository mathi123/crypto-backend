const theInternet = require('request-promise-native');

class EtherscanApi{
    constructor(){
        this.apiKey = '1GDDAY45D73RIY89C3EAY9QDVT7MSKB21E';
        this.okStatus = 1;
        this.weiToEther = Math.pow(10, 18);
    }

    async getBalance(address){
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`;

        const options = {
            uri: url,
            json: true
        };

        let data = null;
        try{
            data = await theInternet(options);
        }catch(Error){}

        if(data === null || data === undefined || data.status != this.okStatus || data.result === null || data.result === undefined){
            throw new Error('Could not get balance.');
        }

        return data.result / this.weiToEther;
    }

    async getTransactions(address){    
        const url = `http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${this.apiKey}`;
        
        const options = {
            uri: url,
            json: true
        };

        let data = null;
        
        try{
            data = await theInternet(options);
        }catch(Error){}

        if(data === null || data === undefined || data.status != this.okStatus || data.result === null || data.result === undefined){
            console.log(data);
            throw new Error('Could not get transactions for '+address);
        }

        let transactions = [];
        for(let element of data.result){
            let formatted = this.formatResultData(element);
            
            if(element.to.toLowerCase() !== address.toLowerCase()){
                formatted.value = -formatted.value;
            }

            transactions.push(formatted);
        }

        return transactions;
    }

    formatResultData(t){
        var result = {
            id: t.transactionIndex,
            time: t.timeStamp * 1000,
            from: t.from,
            to: t.to,
            value: t.value / this.weiToEther,
        }

        return result;
    }
}

module.exports = EtherscanApi;
