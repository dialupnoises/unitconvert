var fs = require('fs');

var defaultUnits = JSON.parse(fs.readFileSync('default.json'));

module.exports = function(units)
{
	if(!units)
		units = defaultUnits;
	return require('./lib/converter')(units);		
}

module.exports.units = defaultUnits;