const request = require('supertest');
const EtherscanIo = require('../apis/etherscan.io');
const expect = require('chai').expect;
const sinon = require('sinon');
const uuid = require('uuid/v4');
const testEtherAddress = '0x774674721019061a89fcd312e8040c0fe67613ce';

describe('EtherscanIo API', () => {
    let api;

    beforeEach(() => {
        api = new EtherscanIo();
    });

    describe('/getBalance', () => {
        it('returns balance', async () => {

            let result = await api.getBalance(testEtherAddress);

            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        });
    });

    describe('/getTransactions', () => {
        it('returns transactions', async () => {
            let result = await api.getTransactions(testEtherAddress);

            expect(result).not.to.equal(null);
            expect(result).not.to.equal(undefined);
        });
    });
});
