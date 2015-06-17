"use strict";
var table;
var context;
var stage;
var pr = window.devicePixelRatio;

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
	table = document.getElementById("table");
	context = table.getContext('2d');
	stage = new createjs.Stage("table");

	table.style.background = "#69CF88";

	sizeCanvas();

	drawEverything();
}

function sizeCanvas() {
	if (window.innerWidth >= 720) {
		table.width = window.innerWidth;
	} else {table.width = 720;}

	if (window.innerHeight >= 720) {
		table.height = window.innerHeight;
	} else {table.height = 720;}
}

function drawEverything() {
	// Eventually have different draws based on what size the screen is at. Draw mobile
	// layout for screen size < 800px or whatever arbitrary amount. Draw desktop otherwise.
	stage.removeAllChildren();

	//Testing methods
	drawTestIcons();
	infoDump();

	drawDrawerIcon();
	drawHand();
	drawOpponentHand();

	stage.update();
}

function drawTestIcons() {

	drawMiniCard("\u2665", "red", "7", 200, 200);
	drawMiniCard("\u2660", "black", "Q", 400, 200);
	drawMiniCardDown(300, 200);
	drawCard("\u2663", "black", "A", 100, 400);
}

//Currently a hard-coded method to demonstrate hand appearance.
function drawHand() {
	var offset = 0;
	var handcenter = table.width/2;
	for (var i = 0; i < 26; i++) {
		drawCard("\u2666", "red", "8", (handcenter - (13*40) - 60)+offset, table.height-100);
		offset += 40;
	}
}

function drawOpponentHand() {
	var offset = 0;
	for (var i = 0; i < 26; i++) {
		drawMiniCardDown(500 + offset, 200);
		offset += 20;
	}
}

function drawMiniCardDown(x, y) {
	var card = new createjs.Container();

	var cardboard = new createjs.Shape();
	cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 70, 98, 10);
	cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

	var picture = new createjs.Text("\uE410", "64px Material Icons", "lightblue");
	picture.textBaseline = "top";
	picture.textAlign = "center";
	picture.x = 35;
	picture.y = (98 - picture.getMeasuredHeight())/2;

	card.addChild(cardboard, picture);
	card.x = x;
	card.y = y;
	
	stage.addChild(card);
}

//Save suit (unicode), value, and color variables in Card objects and consolidate those parameters
//into a single Card object in this function. Pass in coordinates to start draw on.
function drawMiniCard(suit, color, value, x, y) {
	var card = new createjs.Container();

	var cardboard = new createjs.Shape();
	cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 70, 98, 10);
	cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

	var value = new createjs.Text(value, "36px Roboto Condensed", color);
	value.textBaseline = "top";
	value.textAlign = "center";
	value.x = 35;
	value.y = 10;

	var suit = new createjs.Text(suit, "36px Roboto Condensed", color);
	suit.textBaseline = "top";
	suit.textAlign = "center";
	suit.x = 35;
	suit.y = 10 + value.getMeasuredHeight();

	card.addChild(cardboard, suit, value);
	card.x = x;
	card.y = y;
	stage.addChild(card);
}

//Pass in Card object as parameter and use suit and value variables to set text.
function drawCard(suit, color, value, x, y) {
	var card = new createjs.Container();

	var cardboard = new createjs.Shape();
	cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 120, 168, 10);
	cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

	var value = new createjs.Text(value, "36px Roboto Condensed", color);
	value.textBaseline = "top";
	value.textAlign = "center";
	value.y = 10;

	var suit = new createjs.Text(suit, "36px Roboto Condensed", color);
	suit.textBaseline = "top";
	suit.textAlign = "left";
	suit.x = 5;
	suit.y = 10 + value.getMeasuredHeight();

	value.x = 5 + (suit.getMeasuredWidth()/2);

	card.addChild(cardboard, suit, value);
	card.x = x;
	card.y = y;
	stage.addChild(card);
}

function infoDump() {
	var color = "black";
	var font = "24px Roboto Condensed";

	var dw = new createjs.Text("Viewport width: " + window.innerWidth, font, color);
	dw.x = 400;
	dw.y = 350;

	var dh = new createjs.Text("Viewport height: " + window.innerHeight, font, color);
	dh.x = 400;
	dh.y = 400;

	var prtext = new createjs.Text("Pixel ratio: " + pr, font, color);
	prtext.x = 400;
	prtext.y = 450;

	var sw = new createjs.Text("Screen width: " + screen.width, font, color);
	sw.x = 400;
	sw.y = 500;

	var sh = new createjs.Text("Screen height: " + screen.height, font, color);
	sh.x = 400;
	sh.y = 550;

	var asw = new createjs.Text("Available screen width: " + screen.availWidth, font, color);
	asw.x = 400;
	asw.y = 600;

	var ash = new createjs.Text("Available screen height: " + screen.availHeight, font, color);
	ash.x = 400;
	ash.y = 650;

	stage.addChild(dw, dh, prtext, sw, sh, asw, ash);
}

function drawDrawerIcon() {
	var drawerIcon = new createjs.Text("\uE88E", (48*pr) + "px Material Icons", "#F1F1F1");
	drawerIcon.x = drawerIcon.y = 10;
	stage.addChild(drawerIcon);
}

window.addEventListener('resize', function() {
	sizeCanvas();
	drawEverything();
});