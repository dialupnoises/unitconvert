var request = require('request');

var Converter = {};
var splitWords = ['to', 'in', 'at', 'as', '='];
var unitObj = {};
var defaultUnits = {};
var metricPrefixes = {
	yotta: {short: 'Y', exponent: 24},
	zetta: {short: 'Z', exponent: 21},
	exa: {short: 'E', exponent: 18},
	peta: {short: 'P', exponent: 15},
	tera: {short: 'T', exponent: 12},
	giga: {short: 'G', exponent: 9},
	mega: {short: 'M', exponent: 6},
	kilo: {short: 'k', exponent: 3},
	hecto: {short: 'h', exponent: 2},
	deca: {short: 'da', exponent: 1},
	deci: {short: 'd', exponent: -1},
	centi: {short: 'c', exponent: -2},
	milli: {short: 'm', exponent: -3},
	micro: {short: 'µ', exponent: -6},
	nano: {short: 'n', exponent: -9},
	pico: {short: 'p', exponent: -12},
	femto: {short: 'f', exponent: -15},
	atto: {short: 'a', exponent: -18},
	zepto: {short: 'z', exponent: -21},
	yocto: {short: 'y', exponent: -24}
};

var currencyObj = {};
var currency = {};
var cryptsyCache = {};

Converter.initialize = function(units) {
	Converter.units = units;
	var types = Object.keys(units.units);
	types.forEach(function(type) {
		var category = units.units[type];
		defaultUnits[type] = category.default.aliases[0];
		category.default.aliases.forEach(function(alias) {
			unitObj[alias] = {
				type: type, 
				value: 1
			};
		});
		unitObj[category.default.metricShort] = { type: type, value: 1 };
		if(category.default.metric)
		{
			var defaultMetric = metricAliases(category.default.aliases, category.default.metricShort, 1);
			Object.keys(defaultMetric).forEach(function(key) {
				unitObj[key] = {type: type, value: defaultMetric[key]};
			});
		}
		units.units[type].units.forEach(function(unit) {
			unit.aliases.forEach(function(alias) {
				unitObj[alias] = {type: type, value: unit.value, formatted: unit.formatted};
			});
		});
	});

	currency = units.currency;
	currency['state'].forEach(function(state) { currencyObj[state.code] = {name: state.name, type: 'state'}; });
	currency['crypto'].forEach(function(crypto) { currencyObj[crypto.code] = {name: crypto.name, type: 'crypto', market: crypto.market}; });
	currency['other'].forEach(function(other) { currencyObj[other.code] = {name: other.name, type: 'other'}; });
}

Converter.cryptoValue = function(code, callback) {
	if(currencyObj[code].value)
		return callback(null, currencyObj[code].value);
	if(!currencyObj['BTC'].value)
		return request('http://preev.com/pulse/units:btc+xau/sources:bitfinex+bitstamp+btce+localbitcoins', function(err, res, body) {
			if(err) return callback(err);
			var data = JSON.parse(body);
			var btcUsd = parseFloat(data.btc.usd.bitstamp['last']);
			var xauUsd = parseFloat(data.xau.usd.other.last);
			currencyObj['BTC'].value = xauUsd / btcUsd;
			Converter.cryptoValue(code, callback);
		});
	request('http://pubapi.cryptsy.com/api.php?method=singlemarketdata&marketid=' + currencyObj[code].market, function(err, res, body) {
		if(err) return callback(err);
		var data = JSON.parse(body);
		var lastPrice = data.return.markets[code].lasttradeprice;
		var price = currencyObj['BTC'].value / lastPrice;
		currencyObj[code].value = price;
		return callback(null, price);
	});
}

Converter.currencyValue = function(code, callback) {
	if(currencyObj[code].type == 'crypto')
		return Converter.cryptoValue(code, callback);
	if(currencyObj[code].value)
		return callback(null, currencyObj[code].value);
	request('http://finance.yahoo.com/d/quotes.csv?e=.csv&f=l1&s=XAU'+code+'=X', function(err, res, body) {
		if(err) return callback(err);
		var price = parseInt(body.trim());
		currencyObj[code].value = price;
		callback(null, price);
	});
}

function metricAliases(aliases, shortAlias, value)
{
	var units = {};
	aliases.forEach(function(alias) {
		Object.keys(metricPrefixes).forEach(function(prefix) {
			units[prefix + alias] = value * Math.pow(10, metricPrefixes[prefix].exponent);
		});	
	});
	Object.keys(metricPrefixes).forEach(function(prefix) {
		var metricPrefix = metricPrefixes[prefix];
		units[metricPrefix.short + shortAlias] = value * Math.pow(10, metricPrefix.exponent);
	});	
	return units;
}

Converter.convert = function(str, callback) {
	if(str.length == 0) return callback('No string provided.');
	var includesSplit = false;
	splitWords.map(function(v) { if(str.indexOf(v) != -1) includesSplit = true; });
	if(!includesSplit) return callback('Cannot parse expression.');
	for(var i=0;i<str.length;i++)
	{
		var ch = str.charAt(i);
		if(/\d/.test(ch))
			continue;
		else if(/\s/.test(ch))
			break;
		else if(i > 0)
		{
			str = str.slice(0, i) + ' ' + str.slice(i);
			break;
		}
	}
	var parts = str.split(' ');
	var splitIndex = -1;
	for(var i=0;i<parts.length;i++)
	{
		var part = parts[i];
		if(splitWords.indexOf(part) != -1)
		{
			splitIndex = i;
			break;
		}
	}
	var num = parseFloat(parts[0]);
	if(num == NaN)
			return callback(parts[0] + ' is not a valid number.');
	var unitStr = parts.slice(splitIndex + 1).join(' ').trim();
	var fromStr = parts.slice(1, splitIndex).join(' ').trim();
	var unit = findUnit(unitStr);
	var fromUnit = findUnit(fromStr);
	if(!unit || !fromUnit)
	{
		var currency = currencyObj[unitStr.toUpperCase()];
		var fromCurrency = currencyObj[fromStr.toUpperCase()];
		if(!currency || !fromCurrency)
			return callback('Cannot find unit or currency ' + (currency == null ? fromStr : unitStr) + '.');
		Converter.currencyValue(unitStr.toUpperCase(), function(err, toPrice) {
			Converter.currencyValue(fromStr.toUpperCase(), function(err, fromPrice) {
				var price = toPrice / fromPrice;
				return callback(null, price, currency.name);
			});
		});
		return;
	}
	if(unit.type != fromUnit.type)
		return callback('Cannot convert ' + unit.type + ' to ' + fromUnit.type + '.');
	var numInDefault = num * fromUnit.value;
	var finalValue = numInDefault / unit.value;
	var finalStr;
	if(unit.formatted)
		finalStr = (finalValue == 1 ? unit.formatted[0] : unit.formatted[1]);
	else
		finalStr = unit.name.toLowerCase() + (finalValue == 1 ? 's' : '');
	return callback(null, finalValue, finalStr)
}

function findUnit(str)
{
	function checkUnit(str)
	{
		if(unitObj[str])
			return unitObj[str];
		if(unitObj[str.toLowerCase()])
			return unitObj[str.toLowerCase()];
		return null;
	}
	var unit = checkUnit(str);
	if(unit) return unit;
	str = str.replace('sq ', 'square ');
	var pluralEndings = ['es', 's'];
	for(var i=0;i<pluralEndings.length;i++)
	{
		if(str.length < pluralEndings[i].length) continue;
		var singular = str.substr(0, str.length - pluralEndings[i].length);
		unit = checkUnit(singular);
		if(unit) return unit;
	}
	if(currencyObj[str.trim().toUpperCase()])
		return null;
	var closestUnit = Object.keys(unitObj).sort(function(a,b) { return getEditDistance(a, str) - getEditDistance(b, str); });
	if(getEditDistance(closestUnit[0], str) < 4)
		return checkUnit(closestUnit[0]);
	return null;
}

// http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
function getEditDistance(a, b) {
	if(a.length === 0) return b.length; 
	if(b.length === 0) return a.length; 
 
	var matrix = [];
	var i;
	for(i = 0; i <= b.length; i++){
		matrix[i] = [i];
	}
	var j;
	for(j = 0; j <= a.length; j++){
		matrix[0][j] = j;
	}
	for(i = 1; i <= b.length; i++){
		for(j = 1; j <= a.length; j++){
			if(b.charAt(i-1) == a.charAt(j-1)){
				matrix[i][j] = matrix[i-1][j-1];
			} else {
				matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
			}
		}
	}

	return matrix[b.length][a.length];
}

module.exports = function(units)
{
	Converter.initialize(units);
	return Converter;
}