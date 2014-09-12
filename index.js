var fs = require('fs'),
    path = require('path');

var defaultUnits = JSON.parse(fs.readFileSync(path.join(__dirname, 'default.json')));

module.exports = function(units)
{
	if(!units)
		units = defaultUnits;
	return require('./lib/converter')(units);		
}

module.exports.units = defaultUnits;