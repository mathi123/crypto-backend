const request = require('supertest');
const should = require('should');
const server = require('../../app/server');
const uuid = require('uuid/v4');
const HttpStatusCode = require('http-status-codes');
const models = require('../../models/index');

const app = server.start();
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MWY2YjdhMi0xMzA2LTRjNDEtODZkYS03Y2EyOGNlMjhlZDIiLCJpYXQiOjE0OTI0NDY5NzF9.FzYRLb9Fir3Yl8QdA4BMRMgskHTYul0DlxwSQ1ktwMg';

describe('GET /role', () => {
    it('should return an array of roles', (done) => {
        request(app)
            .get('/api/role')
            .set('Accept', 'application/json')
            .set('authorization', token)
            .expect(HttpStatusCode.OK, (err, res) => {
                if (err) return done(err);

                res.body.should.be.an.instanceOf(Array);

                done();
            });
    });
});