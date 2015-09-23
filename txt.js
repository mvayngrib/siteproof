
var prefix = 'tradle:'
var TXT_REGEX = /^tradle\:([0-9a-f]+)$/

module.exports = {
  extractSig: function (txtRecord) {
    if (Buffer.isBuffer(txtRecord)) {
      txtRecord = txtRecord.toString()
    }

    var match = txtRecord.match(TXT_REGEX)
    return match && match[1]
  },
  createRecord: function (sig) {
    return new Buffer(prefix + sig)
  }
}
