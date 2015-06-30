"use strict";
// cardSpec is a 2-char string where the first char represents the card's value
// (A2345678910JQKSB where S/B represents Joker) and the second char represents
// its suit (SHCDT where T is the Jokers' suit)
// Always special cases of course. cardSpec can be 3 characters, but only when
// the value is 10.
// isTrump is an optional boolean whose purpose should be obvious. Defaults to
// false except for Jokers.
function genCard(cardSpec, isTrump) {
	if (typeof isTrump === 'undefined') {
		isTrump = false;
	}
	var valLookup = [0, 0, '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J',
		'Q', 'K', 'A', 0, 0, 'S', 'B'];
	var suitLookup = {'S': 'spades',
					'H': 'hearts',
					'D': 'diamonds',
					'C': 'clubs',
					'T': 'trump'};
	var name = (cardSpec.length === 3) ? cardSpec.slice(0, 2)
									: cardSpec[0];
	var value = valLookup.indexOf(name);
	var suit = suitLookup[cardSpec[cardSpec.length - 1]];
	isTrump = value === 17 || value === 18 || isTrump;
	var points = 0;
	if (value === 13 || value === 10) {
		points = 10;
	} else if (value === 5) {
		points = 5;
	}
	return new Card(suit, name, value, isTrump, points);
}

// cardSpecs is an array of cardSpec strings as described in genCard
// trumpSpec is the cardSpec for the trump that was played. Points and trump
// status for generated cards will be based on this.
function genCards(cardSpecs, trumpSpec) {
	var cards = [];
	var trumpCard = genCard(trumpSpec, true);
	for (var i = 0, len = cardSpecs.length; i < len; i++) {
		var card = genCard(cardSpecs[i]);
		if (card.suit === trumpCard.suit) {
			card.isTrump = true;
		}
		if (card.cardValue === trumpCard.cardValue) {
			card.isTrump = true;
			card.cardValue = card.suit === trumpCard.suit ? 16 : 15;
		}
		cards.push(card);
	}
	return cards;
}


QUnit.module("genCard");
QUnit.test("AS", function(assert) {
	assert.deepEqual(genCard('AS'), new Card('spades', 'A', 14, false, 0));
});
QUnit.test("BT", function(assert) {
	assert.deepEqual(genCard('BT'), new Card('trump', 'B', 18, true, 0));
});
QUnit.test("ST", function(assert) {
	assert.deepEqual(genCard('ST'), new Card('trump', 'S', 17, true, 0));
});
QUnit.test("KD", function(assert) {
	assert.deepEqual(genCard('KD'), new Card('diamonds', 'K', 13, false, 10));
});
QUnit.test("10C", function(assert) {
	assert.deepEqual(genCard('10C'), new Card('clubs', '10', 10, false, 10));
});
QUnit.test("ST !isTrump", function(assert) {
	assert.deepEqual(genCard('ST', false), new Card('trump', 'S', 17, true, 0));
});
QUnit.test("AD isTrump", function(assert) {
	assert.deepEqual(genCard('AD', true), new Card('diamonds', 'A', 14, true, 0));
});


QUnit.module("genCards");
QUnit.test("AS 2D", function(assert) {
	assert.deepEqual(genCards(['AS'], '2D'), [new Card('spades', 'A', 14, false, 0)]);
});
QUnit.test("AS 2S", function(assert) {
	assert.deepEqual(genCards(['AS'], '2S'), [new Card('spades', 'A', 14, true, 0)]);
});
QUnit.test("AS AS", function(assert) {
	assert.deepEqual(genCards(['AS'], 'AS'), [new Card('spades', 'A', 16, true, 0)]);
});
QUnit.test("AD AS", function(assert) {
	assert.deepEqual(genCards(['AD'], 'AS'), [new Card('diamonds', 'A', 15, true, 0)]);
});


QUnit.module("tractor validation fail");
QUnit.test("JQAAS", function(assert) {
	var cards = genCards(['JS', 'QS', 'AS', 'AS'], '2S');
	assert.notOk(checkIsTractor(cards));
});
QUnit.test("2233S 3C", function(assert) {
	var cards = genCards(['2S', '2S', '3S', '3S'], '3C');
	assert.notOk(checkIsTractor(cards));
});
QUnit.test("3344S 3C", function(assert) {
	var cards = genCards(['3S', '3S', '4S', '4S'], '3C');
	assert.notOk(checkIsTractor(cards));
});
QUnit.test("33344S 2C", function(assert) {
	var cards = genCards(['3S', '3S', '3S', '4S', '4S'], '2C');
	assert.notOk(checkIsTractor(cards));
});


QUnit.module("tractor validation succeed");
QUnit.test("KKAAS 2S", function(assert) {
	var cards = genCards(['KS', 'KS', 'AS', 'AS'], '2S');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("KKAAS22D 2S", function(assert) {
	var cards = genCards(['KS', 'KS', 'AS', 'AS', '2D', '2D'], '2S');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("JJKKD QC", function(assert) {
	var cards = genCards(['JD', 'JD', 'KD', 'KD'], 'QC');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("AAS44D 4H", function(assert) {
	var cards = genCards(['AS', 'AS', '4D', '4D'], '4H');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("AAS44s 4H", function(assert) {
	var cards = genCards(['AS', 'AS', '4S', '4S'], '4H');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("44S44H 4H", function(assert) {
	var cards = genCards(['4S', '4S', '4H', '4H'], '4H');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("44HSS 4H", function(assert) {
	var cards = genCards(['4H', '4H', 'ST', 'ST'], '4H');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("SSBB 4H", function(assert) {
	var cards = genCards(['ST', 'ST', 'BT', 'BT'], '4H');
	assert.ok(checkIsTractor(cards));
});
QUnit.test("333444S 2C", function(assert) {
	var cards = genCards(['3S', '3S', '3S', '4S', '4S', '4S'], '2C');
	assert.notOk(checkIsTractor(cards));
});
