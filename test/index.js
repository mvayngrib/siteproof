
var test = require('tape')
var dns = require('dns.js')
var kiki = require('kiki')
var Identity = require('midentity').Identity
var verify = require('../verify')
var prove = require('../prove')
var bill = Identity.fromJSON(require('./fixtures/bill-pub'))
var billKeys = require('./fixtures/bill-priv')
var TXT = require('../txt')

var site = {
  url: 'wyldstallyns.com'
}

var siteWCustomProof = {
  url: site.url,
  proof: 'string to be signed'
}

testSite(site, '3045022100e61c05456dabe959f24aaa5d9169c574c68bf1186ef007168961ab1abd647f150220371c350673bb0179972726451f25bdf53c13bd1ea8ac4343a31f7142f044a20a')
testSite(siteWCustomProof, '304502202aa8506a745fd5fa352156902e7ae6a5c945d9f88eadb2dd5fc51ae2b1d43f53022100e5ee4c49913a6c06fa4d32795b8661f1eae03d6b884322e146c54d80bb523fb4')

function testSite (site, expectedSig) {
  test('prove', function (t) {
    t.plan(1)

    var ecKey = billKeys.filter(function (key) {
      return key.purpose === 'sign' && key.type === 'ec'
    })[0]

    ecKey = kiki.toKey(ecKey)
    prove(ecKey, site)
      .done(function (sig) {
        t.equal(TXT.extractSig(sig), expectedSig)
      })
  })

  test('verify', function (t) {
    t.plan(6)

    var query = dns.query
    var site = bill.websites()[0].toJSON()
    var ecKey = billKeys.filter(function (key) {
      return key.purpose === 'sign' && key.type === 'ec'
    })[0]

    ecKey = kiki.toKey(ecKey)
    testSuccess()
      .then(testFail)
      .done(function () {
        dns.Client.prototype.query = query
      })

    function testSuccess () {
      return runTest(true)
        .then(function (passed) {
          t.equal(passed, true)
        })
    }

    function testFail () {
      return runTest(false)
        .then(function (passed) {
          t.equal(passed, false)
        })
    }

    function runTest (pass) {
      return prove(ecKey, site)
        .then(function (txtRecord) {
          dns.Client.prototype.query = function (type, url, cb) {
            t.equal(type, 'TXT')
            t.equal(url, site.url)
            var records = [
              pass ? txtRecord : 'blah0',
              'blah1',
              'blah2',
              'blah3'
            ].map(Buffer)

            cb(null, records)
          }

          return verify(bill, site)
        })
    }
  })
}
