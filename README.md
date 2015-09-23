# siteproof

[![Build Status](https://travis-ci.org/mvayngrib/siteproof.svg)](https://travis-ci.org/mvayngrib/siteproof)

Prove/verify domain ownership

## Usage

```js
var Keys = require('kiki').Keys
var siteproof = require('siteproof')
var site = { url: 'somewhereawesome.com' }
// Alternatively:
// var site = {
//   url: 'google.com',
//   proof: 'this string is signed in a TXT record on somewhereawesome.com'
// }
var key = Keys.EC.gen({
  curve: 'ed25519'
})

// prove
siteproof.prove(key, site)
  .done(function (txtRecord) {
    // put `txtRecord` in a TXT record on somewhereawesome.com
    console.log(txtRecord)
  })

// verify
siteproof.verify(key, site)
  .done(function (verified) {
    // if `sig` was found in a TXT record on somewhereawesome.com
    // `verified` will be true
    console.log(verified)
  })
```
