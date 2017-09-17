const request = require('supertest');
const CryptoCompareApi = require('../apis/cryptocompare');
const expect = require('chai').expect;
const sinon = require('sinon');
const uuid = require('uuid/v4');

describe('CryptoCompare API', () => {
    let api;

    beforeEach(() => {
        api = new CryptoCompareApi();
    });

    describe('/getprice', () => {
        it('returns prices', async () => {
            let fromDate = new Date(2014, 1, 1);
            let toDate = new Date(2014, 1, 10);
            
            let result = await api.getPrices(fromDate, toDate, ['btc'], 50, []);

            console.log(result);
            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        }).timeout(10000);
    });
});
