
var Q = require('q')
var kiki = require('kiki')
var TXT = require('./txt')

/**
 * prove ownership of a domain
 * @param  {kiki.Key|Array} key - key or array of keys
 * @param  {Object} domain - { url: 'somedomain.com' } or { url: 'somedomain.com', proof: 'blah' }
 * @return {Q.Promise} promise - resolves to signature
 */
module.exports = function prove (key, domain) {
  if (Array.isArray(key)) {
    key = key.filter(function (k) {
      return k.type === 'ec' && k.purpose === 'sign'
    })[0]
  }

  key = kiki.toKey(key)
  var data = domain.proof || domain.url
  return Q.ninvoke(key, 'sign', data)
    .then(function (sig) {
      return TXT.createRecord(sig)
    })
}
