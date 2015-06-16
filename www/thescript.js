"use strict";
var table;
var context;
var pr = window.devicePixelRatio;
// var stage; For EaselJS

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
	table = document.getElementById("table");
	context = table.getContext('2d');
	// stage = new createjs.Stage("table"); EaselJS

	table.style.background = "#69CF88";
	table.width = window.innerWidth;
	table.height = window.innerHeight;

	drawEverything();
}

function drawEverything() {
	// Eventually have different draws based on what size the screen is at. Draw mobile
	// layout for screen size < 800px or whatever arbitrary amount. Draw desktop otherwise.

	drawIcons();
	infoDump();
	drawDrawer();
}

function drawIcons() {
	context.font = "100px Material Icons";
	context.fillText("\uE32A", 400, 500);
	context.font = "48px Roboto Condensed";
	context.fillText("7" + "\u2663", 400, 300);
	context.fillStyle = "red";
	context.fillText("A" + "\u2665", 600, 300);
}

function infoDump() {
	var w = window.innerWidth;
	context.fillStyle = "black";
	context.font = "48px Roboto Condensed";
	context.fillText("Device width: " + w, 400, 600);
	context.fillText("Pixel ratio: " + pr, 400, 650);
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
	if (window.innerWidth >= 720) {
		table.width = window.innerWidth;
		drawEverything();
	}
	if (window.innerHeight >= 720) {
		table.height = window.innerHeight;
		drawEverything();
	}
});