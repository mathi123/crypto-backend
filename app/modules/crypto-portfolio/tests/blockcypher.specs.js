const request = require('supertest');
const BlockCypher = require('../apis/blockcypher');
const expect = require('chai').expect;
const sinon = require('sinon');
const uuid = require('uuid/v4');

describe('BlockCypher BTC API', () => {
    let api;
    let testAddress = '1J3PRZT5DcHG92zh4tBvAKo6iierEYTMMr';

    beforeEach(() => {
        api = new BlockCypher("btc");
    });

    describe('/getBalance', () => {
        it('returns balance', async () => {

            let result = await api.getBalance(testAddress);

            console.log(result);
            
            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        });
    });

    describe('/getTransactions', () => {
        it('returns transactions', async () => {
            let result = await api.getTransactions(testAddress);

            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        });
    });
});

describe('BlockCypher LTC API', () => {
    let api;
    let testAddress = 'LXFwxKpkpp4Y8au77CTUENemgmBzooo2Sh';

    beforeEach(() => {
        api = new BlockCypher("ltc");
    });

    describe('/getBalance', () => {
        it('returns balance', async () => {
            let result = await api.getBalance(testAddress);

            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        });
    });

    describe('/getTransactions', () => {
        it('returns transactions', async () => {

            let result = await api.getTransactions(testAddress);
            
            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        });
    });
});
