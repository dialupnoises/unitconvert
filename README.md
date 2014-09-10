# unitconvert

Node.js library for converting from one unit to another. Pretty simple.

In short, it takes user-provided strings, like `1 barleycorn in yards`, and returns the result. 

In long, it can turn any unit specified in the constructor into any other unit specified in the constructor. It can do currencies too (state and crypto). It ships with probably every unit you'll need, but you can specify more if you want.

## Guide

You can install unitconvert via npm:

    npm install unitconvert
    
You can then create a `Converter` object by requiring unitconvert like this: 

    var converter = require('unitconvert')();

If you want to provide custom units to unitconvert, you can pass a `units` object as the argument (see "Custom Units" below). You can access `unitconvert.units` if you need the default unit set:

    var unitconvert = require('unitconvert');
    unitconvert.units['units']['length']['units'].push({
        name:'Fake Unit',
        aliases:['fake'],
        value: 12,
        formatted: ['fake', 'fakes']
    });
    var converter = unitconvert();
    
Then you can use `converter.convert` with a string and a callback:

    converter.convert('1 Pa in atm', function(err, value, str) {
        console.log('1 Pa in atm = ' + value + ' ' + str);
    });
    
`value` is the converted value. `str` is the formatted result unit (like 'atmospheres').

## Currency Conversion

unitconvert can convert between any state currency (Euro, USD, etc), any of the seven included crypto-currencies (BTC, LTC, etc), and any of the four precious metals that people care about (XAU, XAG, etc). Since currency exchange rates can change quickly, they're not included in the units object. Instead, the exchange rate of XAU to the provided currency is looked up using `Converter.currencyValue`. By default, this function uses the Yahoo! Finance API. You can override this by specifying your own currencyValue function:

    converter.currencyValue = function(code, callback) {
        callback(null, 1);
    };
    
This function accepts two arguments, `code` and `callback`. `code` is the ISO currency code, while `callback` is a function that accepts `err` and `price`. Price should be the purchasing power of gold in that currency; for example, if one troy ounce of gold (1 XAU) buys 1200 USD, you'd return 1200. Results are cached in-memory, so only one lookup is done until you create another `Converter` object.

### Crypto-Currency

Crypto-currency has an equivalent function, `Converter.cryptoValue`. It accepts the same parameters and functions the same as the other one, though with crypto-currency.

## Custom Units

You can specify custom units by adding a new key to the `units` key in the `units` object. This key specifies the unit type. For example, take a look at a simple "length" unit:

    {
    	"units": {
    		"length": {
    			"default": {
    				"name": "Meter",
    				"aliases": ["meter", "metre"],
    				"metric": true,
    				"metricShort": "m"
    			},
    			"units": [
    				{
    					"name": "Foot",
    					"aliases": ["foot", "feet", "ft"],
    					"value": 0.3048,
    					"formatted": ["foot", "feet"]
    				},
    				{
    					"name": "Inch",
    					"aliases": ["inch", "in"],
    					"value": 0.0254,
    					"formatted": ["inch", "inches"]
    				}
    			]
    		}
    	}
    }
    
This defines a new type of unit - `length` - a default unit that's used as an intermediary for conversion - meter - and extra units of that type - feet and inches.

The intermediary unit, in this case the meter, is what every other unit's value is specified as. For example, a foot is 0.3048 meters. Also specified in the `default` unit is its aliases, both meter and metre, and metric prefixes. For simplicity, specifying `metric` and a `metricShort` value will automatically generate the unit with all the metric prefixes. So this will also generate millimeter, nanometer, kilometer, etc. It will also generate all the short values of this - mm, nm, km, etc. 

For each unit, you need to specify a `value` in the intermediary unit. You also need to specify a `formatted` array with the first value being the singular and the second value being the plural. If ou don't specify one, it'll just append `s` to the end of the name in lowercase to make it plural.

## License

The MIT License (MIT)

Copyright (c) 2014 Andrew Rogers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.