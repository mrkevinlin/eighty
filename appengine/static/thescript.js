"use strict";
var table;
var context;
var stage;
var pr;

if (screen.availWidth > 768) {pr = 1;}
else {pr = 4/3;}

// if (pr >= 1.5 && pr <= 2.5) {pr = 1.33;}
// else if (pr > 2.5 && pr <= 3.5) {pr = 1.5;}
// else if (pr > 3.5) {pr = 2;}

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
	table = document.getElementById("table");
	context = table.getContext('2d');
	stage = new createjs.Stage("table");

	table.style.background = "#66BB6A";

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
	// drawTestPlay();
	drawCircle();

	drawDrawerIcon();
	drawHand();
	// drawOpponentHand(); 

	infoDump();


// REMINDER:
//
// Eventually figure out how to put each card container into a hand container to move hand container.
//
//


	stage.update();
}

function drawCircle() {
	var xpoints = [];
	var ypoints = [];

	
}

function drawTestIcons() {

	drawMiniCard("\u2665", "red", "7", 300*pr, 50);
	drawMiniCard("\u2660", "black", "Q", 400*pr, 50);
	drawMiniCardDown(500*pr, 50);
	drawCard("\u2663", "black", "A", 600*pr, 50);
}

function drawTestPlay() {
	var offset = 0;
	var arraycolor = ["black", "red", "red", "black", "red", "black"];
	var arraysuit = ["\u2663", "\u2665", "\u2666", "\u2660", "\u2665", "\u2663"];
	var arrayvalue = ["J", "A", "7", "6", "6", "Q"];
	for (var i = 0; i < 6; i++) {
		drawMiniCard(arraysuit[i], arraycolor[i], arrayvalue[i], table.width-(6*40*pr)-60+offset, 300);
		offset += 40*pr;
	}
}

//Currently a hard-coded method to demonstrate hand appearance.
function drawHand() {
	var offset = 0;
	var handcenter = table.width/2;
	for (var i = 0; i < 26; i++) {
		drawCard("\u2666", "red", "8", (handcenter - (14*40*Math.pow(pr,3))) + offset, table.height-120*pr);
		offset += 40*Math.pow(pr,3);
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
	cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 60*pr, 84*pr, 10);
	cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

	var picture = new createjs.Text("\uE410", 64*pr + "px Material Icons", "lightblue");
	picture.textBaseline = "top";
	picture.textAlign = "center";
	picture.x = 30*pr;
	picture.y = (84*pr - picture.getMeasuredHeight())/2;

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
	cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 60*pr, 84*pr, 10);
	cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

	var value = new createjs.Text(value, 36*pr + "px Roboto Condensed", color);
	value.textBaseline = "top";
	value.textAlign = "center";
	value.x = 30*pr;
	value.y = 5*pr;

	var suit = new createjs.Text(suit, 36*pr + "px Roboto Condensed", color);
	suit.textBaseline = "top";
	suit.textAlign = "center";
	suit.x = 30*pr;
	suit.y = 5*pr + value.getMeasuredHeight();

	card.addChild(cardboard, suit, value);
	card.x = x;
	card.y = y;
	stage.addChild(card);
}

//Pass in Card object as parameter and use suit and value variables to set text.
function drawCard(suit, color, value, x, y) {
	var card = new createjs.Container();

	var cardboard = new createjs.Shape();
	cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 120*pr, 168*pr, 10);
	cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

	var value = new createjs.Text(value, 36*pr + "px Roboto Condensed", color);
	value.textBaseline = "top";
	value.textAlign = "center";
	value.y = 10*pr;

	var suit = new createjs.Text(suit, 36*pr + "px Roboto Condensed", color);
	suit.textBaseline = "top";
	suit.textAlign = "left";
	suit.x = 5*pr;
	suit.y = 10*pr + value.getMeasuredHeight();

	value.x = 5*pr + (suit.getMeasuredWidth()/2);

	card.addChild(cardboard, suit, value);
	card.x = x;
	card.y = y;
	stage.addChild(card);
}

function infoDump() {
	var color = "black";
	var font = "24px Roboto Condensed";

	var dw = new createjs.Text("Viewport width: " + window.innerWidth, font, color);
	dw.x = 100;
	dw.y = 50;

	var dh = new createjs.Text("Viewport height: " + window.innerHeight, font, color);
	dh.x = 100;
	dh.y = 80;

	var prtext = new createjs.Text("Pixel ratio: " + pr, font, color);
	prtext.x = 100;
	prtext.y = 110;

	var sw = new createjs.Text("Screen width: " + screen.width, font, color);
	sw.x = 100;
	sw.y = 140;

	var sh = new createjs.Text("Screen height: " + screen.height, font, color);
	sh.x = 100;
	sh.y = 170;

	var asw = new createjs.Text("Available screen width: " + screen.availWidth, font, color);
	asw.x = 100;
	asw.y = 200;

	var ash = new createjs.Text("Available screen height: " + screen.availHeight, font, color);
	ash.x = 100;
	ash.y = 230;

	stage.addChild(dw, dh, prtext, sw, sh, asw, ash);
}

function drawDrawerIcon() {
	var drawerIcon = new createjs.Text("\uE88E", (64*pr) + "px Material Icons", "#F1F1F1");
	drawerIcon.x = drawerIcon.y = 10;
	stage.addChild(drawerIcon);
}

window.addEventListener('resize', function() {
	sizeCanvas();
	drawEverything();
});