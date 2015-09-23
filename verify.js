var Q = require('q')
var dns = require('dns.js')
var TXT = require('./txt')
// var kiki = require('kiki')

module.exports = verify

/**
 * verify ownership of a domain
 * @param  {Identity|Key} identity or key
 * @param  {Object} domainInfo
 *   @example
 *    {
 *      url: 'somewhereawesome.com',
 *      proof: 'this string is signed in a TXT record on somewhereawesome.com'
 *    }
 * @return {Q.Promise} resolves in a boolean
 */
function verify (identity, domainInfo) {
  var client = new dns.Client()
  return Q.ninvoke(client, 'query', 'TXT', domainInfo.url)
    .then(function (txtRecords) {
      return Q.allSettled(txtRecords.map(function (txtRecord) {
        var sig = TXT.extractSig(txtRecord)
        if (!sig) return Q.reject()

        return checkSig(
          identity,
          domainInfo.proof || domainInfo.url,
          sig
        )
      }))
    })
    .then(function (results) {
      client.destroy()
      return some(results)
    })
}

function checkSig (identity, data, sig) {
  var keys
  if (typeof identity.keys === 'function') {
    keys = identity.keys({
      purpose: 'sign',
      type: 'ec'
    })
  } else {
    keys = [identity]
  }

  var verifications = keys.map(function (key) {
    return Q.ninvoke(key, 'verify', data, sig)
  })

  return Q.allSettled(verifications)
    .then(some)
}

function some (results) {
  return results.some(function (r) {
    return r.state === 'fulfilled' && r.value === true
  })
}

// function verify (identity) {
//   var domains = identity.get('websites')
//   if (!domains || !domains.length) return Q.resolve()

//   return Q.allSettled(domains.map(function (d) {
//     return verifyOne(identity, d)
//   }))
// }
