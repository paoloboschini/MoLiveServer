var octocats = require('fs').readdirSync('public/img/octocats/');

octocats = octocats.filter(function(el, idx, arr) {
  return el[0] != '.';
});

octocats = octocats.map(function(el) {
 return '/img/octocats/' + el;
});

exports.octocats = octocats;