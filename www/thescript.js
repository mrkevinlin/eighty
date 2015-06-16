"use strict";
var table;
var context;
// var stage; For EaselJS

function init() {
	table = document.getElementById("table");
	context = table.getContext('2d');
	// stage = new createjs.Stage("table"); EaselJS
	table.width = window.innerWidth;
	table.height = window.innerHeight;

	drawEverything();
}

function drawEverything() {
	// Eventually have different draws based on what size the screen is at. Draw mobile
	// layout for screen size < 800px or whatever arbitrary amount. Draw desktop otherwise.
	context.beginPath();
	context.moveTo(500, 50);
	context.lineTo(750, 150);
	context.stroke();

	drawDrawer();
}

function drawDrawer() {
	var drawerWidth = table.width * .15;
	if (drawerWidth >= 200) {
		context.rect(0,0,drawerWidth, table.height);
		context.fillStyle="gray";
		context.fill();
	} else {
		// EaselJS method
		// var drawerButton = new createjs.Shape();
		// drawerButton.graphics.beginFill("LightGray").drawRect(0,0,64,64);
		// stage.addChild(drawerButton);
		// stage.update();

		//Regular Javascript and HTML5 canvas method
		context.rect(0,0,64,64);
		context.fillStyle="gray";
		context.fill();
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