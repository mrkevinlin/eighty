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

	drawIcons();
	infoDump();
	drawDrawer();

	// stage.update();
}

function drawIcons() {
	context.font = "48px Material Icons";
	context.fillText("\uE32A", 350, 100);
	// var shield = new createjs.Text("\uE32A", "48px Material Icons", "black");
	// shield.x = 350;
	// shield.y = 100;
	// stage.addChild(shield);

	context.fillStyle = "white";
	context.rect(470, 100, 100, 100);
	context.fill();

	context.font = "48px Roboto Condensed";
	context.fillStyle = "black";
	context.fillText("7", 470, 100);
	context.fillText("\u2663", 460, 148);

	context.fillStyle = "red";
	context.fillText("A" + "\u2665", 540, 100);
}

function infoDump() {
	context.fillStyle = "black";
	context.font = "48px Roboto Condensed";
	context.fillText("Device width: " + window.innerWidth, 400, 400);
	context.fillText("Device height: " + window.innerHeight, 400, 450)
	context.fillText("Pixel ratio: " + pr, 400, 500);
}

function drawDrawer() {
	var drawerWidth = table.width * .15;
	if (drawerWidth >= 200) {
		context.rect(0,0,drawerWidth, table.height);
		context.fillStyle="white";
		context.shadowColor = "black";
		context.shadowBlur = 80;
		context.shadowOffsetX = -10;
		context.fill();
	} else {
		// EaselJS method
		// var drawerButton = new createjs.Shape();
		// drawerButton.graphics.beginFill("LightGray").drawRect(0,0,64,64);
		// stage.addChild(drawerButton);
		// stage.update();

		//Regular Javascript and HTML5 canvas method
		context.fillStyle="#F1F1F1";
		context.font = (48 * pr) + "px Material Icons";
		context.fillText("\uE88E", 10*pr, 58*pr);
	}
}

window.addEventListener('resize', function() {
	sizeCanvas();
	drawEverything();
});