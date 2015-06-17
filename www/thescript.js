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

	drawIcons();
	infoDump();
	drawDrawer();

	stage.update();
}

function drawIcons() {
	var shield = new createjs.Text("\uE32A", "48px Material Icons", "black");
	shield.x = 350;
	shield.y = 100;
	stage.addChild(shield);
	// context.font = "48px Material Icons";
	// context.fillText("\uE32A", 350, 100);

	var card = new createjs.Shape();
	card.graphics.beginFill('white').drawRoundRect(445, 100, 70, 98, 5);
	card.shadow = new createjs.Shadow("black", 0, 1, 2);
	stage.addChild(card);
	// context.fillStyle = "white";
	// context.rect(470, 100, 100, 100);
	// context.fill();

	var C = new createjs.Text("\u2663", "48px Roboto Condensed", "black");
	C.x = 460;
	C.y = 148;
	var seven = new createjs.Text("7", "48px Roboto Condensed", "black");
	seven.x = 470;
	seven.y = 100;
	stage.addChild(C, seven);
	// context.font = "48px Roboto Condensed";
	// context.fillStyle = "black";
	// context.fillText("7", 470, 100);
	// context.fillText("\u2663", 460, 148);

	var HA = new createjs.Text("A" + "\u2665", "48px Roboto Condensed", "red");
	HA.x = 540;
	HA.y = 100;
	stage.addChild(HA);
	// context.fillStyle = "red";
	// context.fillText("A" + "\u2665", 540, 100);
}

function infoDump() {
	var color = "black";
	var font = "48px Roboto Condensed";

	var dw = new createjs.Text("Device width: " + window.innerWidth, font, color);
	dw.x = 400;
	dw.y = 400;

	var dh = new createjs.Text("Device height: " + window.innerHeight, font, color);
	dh.x = 400;
	dh.y = 450;

	var prtext = new createjs.Text("Pixel ratio: " + pr, font, color);
	prtext.x = 400;
	prtext.y = 500;

	stage.addChild(dw, dh, prtext);

	// context.fillText("Device width: " + window.innerWidth, 400, 400);
	// context.fillText("Device height: " + window.innerHeight, 400, 450)
	// context.fillText("Pixel ratio: " + pr, 400, 500);
}

function drawDrawer() {
	//Todo: DO THE THING
	var drawerWidth = table.width * .15;
	if (drawerWidth >= 200) {
		var drawer = new createjs.Shape();
		drawer.graphics.beginFill("white").drawRect(0,0,drawerWidth, table.height);
		drawer.shadow = new createjs.Shadow("black", -10, 0, 80);
		stage.addChild(drawer);

		// context.rect(0,0,drawerWidth, table.height);
		// context.fillStyle="white";
		// context.shadowColor = "black";
		// context.shadowBlur = 80;
		// context.shadowOffsetX = -10;
		// context.fill();
	} else {
		var drawerIcon = new createjs.Text("\uE88E", (48*pr) + "px Material Icons", "#F1F1F1");
		drawerIcon.x = drawerIcon.y = 10*pr;
		stage.addChild(drawerIcon);

		// context.fillStyle="#F1F1F1";
		// context.font = (48 * pr) + "px Material Icons";
		// context.fillText("\uE88E", 10*pr, 58*pr);
	}
}

window.addEventListener('resize', function() {

	sizeCanvas();
	drawEverything();
});