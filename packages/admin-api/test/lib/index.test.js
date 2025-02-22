// Switch these lines once there are useful utils
// const testUtils = require('./utils');
require('../utils');
const should = require('should');

const GhostAdminAPI = require('../../lib');

describe('GhostAdminAPI general', function () {
    const config = {
        version: 'v4',
        url: `http://ghost.local`,
        key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0'
    };

    it('Requires a config object with host, version and key', function () {
        should.throws(
            () => new GhostAdminAPI(),
            Error,
            'Missing config object'
        );
        should.throws(
            () => new GhostAdminAPI({url: config.url, version: config.version}),
            Error,
            'Missing config.key property'
        );

        should.throws(
            () => new GhostAdminAPI({version: config.version, key: config.key}),
            Error,
            'Missing config.url property'
        );

        should.doesNotThrow(
            () => new GhostAdminAPI({url: config.url, key: config.key}),
            Error,
            'Missing config.version property'
        );

        should.doesNotThrow(
            () => new GhostAdminAPI({url: config.url, version: config.version, key: config.key}),
            Error,
            'Correct config properties'
        );
        should.doesNotThrow(
            () => new GhostAdminAPI(config),
            Error,
            'Correct config object'
        );
    });

    it('Requires correct key format in config object', function () {
        should.throws(
            () => new GhostAdminAPI({key: 'badkey', url: config.url, version: config.version}),
            Error,
            'Invalid config.key property'
        );
    });

    it('Allows makeRequest override', function () {
        const makeRequest = () => {
            return Promise.resolve({
                config: {
                    test: true
                }
            });
        };
        const api = new GhostAdminAPI(Object.assign({}, config, {makeRequest}));

        return api.config.read().then((data) => {
            should.deepEqual(data, {test: true});
        });
    });

    it('Exposes an API', function () {
        const api = new GhostAdminAPI(config);
        const keyMethodMap = {
            posts: ['read', 'browse', 'add', 'edit', 'delete'],
            pages: ['read', 'browse', 'add', 'edit', 'delete'],
            tags: ['read', 'browse', 'add', 'edit', 'delete'],
            members: ['read', 'browse', 'add', 'edit', 'delete'],
            users: ['read', 'browse', 'add', 'edit', 'delete'],
            webhooks: ['add', 'edit', 'delete'],
            themes: ['upload', 'activate'],
            images: ['upload'],
            media: ['upload'],
            files: ['upload'],
            config: ['read'],
            site: ['read']
        };

        for (const key in keyMethodMap) {
            should.deepEqual(Object.keys(api[key]), keyMethodMap[key]);
        }
    });

    describe('makeApiRequest', function () {
        it('adds Accept-Version header for v4, v5, canary, and no API versions', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));

            const api = new GhostAdminAPI({
                version: 'v5',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5');
        });

        it('adds default "v5" Accept-Version header for non-versioned SDK', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));

            const api = new GhostAdminAPI({
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v5');
        });

        it('does NOT add Accept-Version header for v3 API', async function () {
            const makeRequestStub = sinon.stub().returns(Promise.resolve({
                config: {}
            }));

            const api = new GhostAdminAPI({
                version: 'v3',
                url: `http://ghost.local`,
                key: '5c73def7a21ad85eda5d4faa:d9a3e5b2d6c2a4afb094655c4dc543220be60b3561fa9622e3891213cb4357d0',
                makeRequest: makeRequestStub
            });

            await api.config.read();

            makeRequestStub.calledOnce.should.be.true();
            should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], undefined);
        });
    });
});
