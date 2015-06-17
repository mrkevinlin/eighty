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

	drawTestIcons();
	infoDump();
	drawDrawerIcon();

	stage.update();
}

function drawTestIcons() {

	var card = new createjs.Shape();
	card.graphics.beginFill('white').drawRoundRect(445, 100, 70, 98, 5);
	card.shadow = new createjs.Shadow("black", 0, 1, 2);
	stage.addChild(card);

	var C = new createjs.Text("\u2663", "48px Roboto Condensed", "black");
	C.x = 460;
	C.y = 148;
	var seven = new createjs.Text("7", "48px Roboto Condensed", "black");
	seven.x = 470;
	seven.y = 100;
	stage.addChild(C, seven);

	var HA = new createjs.Text("A" + "\u2665", "48px Roboto Condensed", "red");
	HA.x = 540;
	HA.y = 100;
	stage.addChild(HA);
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