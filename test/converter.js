var converter = require('../index')(),
	should    = require('should');

describe('Converter', function() {
	describe('#convert(str, callback)', function() {
		it('should error when split word not included', function(done) {
			converter.convert('1 meter', function(err, value, str) {
				err.should.not.equal(null);
				done();
			});
		});
		it('should error when an invalid unit is specified', function(done) {
			converter.convert('1 meter to testing unit', function(err, value, str) {
				err.should.not.equal(null);
				done();
			});
		});
		it('should find units directly after number', function(done) {
			converter.convert('1m in feet', function(err, value, str) {
				(err == null).should.equal(true);
				done();
			});
		});
		it('should correct spelling errors', function(done) {
			converter.convert('1 kilemetor to feet', function(err, value, str) {
				(err == null).should.equal(true);
				parseFloat(value.toString()).toFixed(6).should.equal('3280.839895');
				done();
			});
		});
		it('should error on incompatible units', function(done) {
			converter.convert('1 meter to rankine', function(err, value, str) {
				err.should.not.equal(null);
				done();
			});
		});
		it('should handle short metric units', function(done) {
			converter.convert('1 micrometer to Mm', function(err, value, str) {
				(err == null).should.equal(true);
				value.should.equal(1e-12);
				done();
			});
		});
		it('should convert distance correctly', function(done) {
			converter.convert('1 meter to feet', function(err, value, str) {
				parseFloat(value.toString()).toFixed(9).should.equal('3.280839895');
				done();
			});
		});
		it('should convert mass correctly', function(done) {
			converter.convert('1 kilogram to pounds', function(err, value, str) {
				parseFloat(value.toString()).toFixed(9).should.equal('2.204622622');
				done();
			});
		});
		it('should convert temperature correctly', function(done) {
			converter.convert('1 Ra in celsius', function(err, value, str) {
				parseFloat(value.toString()).toFixed(9).should.equal('-272.594444444');
				done();
			});
		});
		it('should convert speed correctly', function(done) {
			converter.convert('1 mph in kmh', function(err, value, str) {
				parseFloat(value.toString()).toFixed(6).should.equal('1.609344');
				done();
			});
		})
		it('should convert volume correctly', function(done) {
			converter.convert('1 bbl in liters', function(err, value, str) {
				parseFloat(value.toString()).toFixed(9).should.equal('158.987294929');
				done();
			});
		});
		it('should convert angles correctly', function(done) {
			converter.convert('1 radian to degrees', function(err, value, str) {
				parseFloat(value.toString()).toFixed(9).should.equal('57.295779513');
				done();
			});
		});
		it('should convert area correctly', function(done) {
			converter.convert('1 sq kilometer to acre', function(err, value, str) {
				parseFloat(value.toString()).toFixed(9).should.equal('247.105381467');
				done();
			});
		});
		it('should convert storage correctly', function(done) {
			converter.convert('1 dvd to gigabytes', function(err, value, str) {
				value.should.equal(4.7);
				done();
			});
		});
		it('should convert energy correctly', function(done) {
			converter.convert('1 BTU in joules', function(err, value, str) {
				parseFloat(value.toString()).toFixed(7).should.equal('1055.0558526');
				done();
			});
		});
		it('should convert force correctly', function(done) {
			converter.convert('1 meganewton to kip forces', function(err, value, str) {
				parseFloat(value.toString()).toFixed(7).should.equal('224.8089431');
				done();
			});
		});
		it('should convert pressure correctly', function(done) {
			converter.convert('1 atm to Pa', function(err, value, str) {
				value.should.equal(101325);
				done();
			});
		});
		it('should convert time correctly', function(done) {
			converter.convert('1 synodic month to minutes', function(err, value, str) {
				value.should.equal(42524.064);
				done();
			});
		});
		it('should convert currency correctly', function(done) {
			converter.convert('1 USD to EUR', function(err, value, str) {
				value.should.be.above(0);
				done();
			});
		});
		it('should convert cryptocurrency correctly', function(done) {
			converter.convert('1 USD to DOGE', function(err, value, str) {
				value.should.be.above(0);
				done();
			});
		});
		it('should convert BTC correctly', function(done) {
			converter.convert('1 BTC to USD', function(err, value, str) {
				(err == null).should.equal(true);
				value.should.be.above(0);
				done();
			});
		});
	});
});