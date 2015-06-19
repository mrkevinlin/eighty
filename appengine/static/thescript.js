"use strict";
var table;
var context;
var stage;
var pr;
var players = [];
var playerCount;
var deck = [];

//Player ring
var degrees;
var xpoints;
var ypoints;
var radius;
var centerx;
var centery;


if (screen.availWidth > 768) {pr = 1;}
else {pr = 4/3;}

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
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
    stage.enableMouseOver(30);

    sizeCanvas();


    playerCount = 8;

    for (var i = 0; i < playerCount; i++) {
        players.push(new Player(i));
    }

    initializeDeck();
    initializeHands();


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

function initializeDeck() {
    var suit = ["spades", "diamonds", "clubs", "hearts"];
    var suitCode = ["\u2660", "\u2666", "\u2663", "\u2665"];
    var suitColor = ["black", "red", "black", "red"];
    var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    var points = 0;

    for (var i = 0; i < Math.floor(playerCount/2); i++) {
        for (var s = 0; s < 4; s++) {
            for (var v = 0; v <= 12; v++) {
                if (v == 5) { points = 5; }
                else if (v == 10 || v == 13) { points = 10; }
                deck.push(new Card(suit[s], suitCode[s], suitColor[s], values[v], false, points));
                points = 0;
            }
        }
    }
}

function initializeHands() {
    var dealID = 0;
    var cardCount = deck.length;
    for (var d = 0; d < cardCount; d++) {
        players[dealID].hand.push(deck[d]);
        dealID++;
        if (dealID >= players.length) {
            dealID = 0;
        }
    }
}

var Player = function(id) {
    this.id = id;
    this.hand = [];
};

var Card = function(suit, suitCode, color, value, isTrump, points) {
    this.suit = suit;
    this.suitCode = suitCode;
    this.suitColor = color;
    this.cardValue = value;
    this.isTrump = isTrump;
    this.points = points;
};

function drawEverything() {
    // Eventually have different draws based on what size the screen is at. Draw mobile
    // layout for screen size < 800px or whatever arbitrary amount. Draw desktop otherwise.
    stage.removeAllChildren();

    //Testing methods
    // drawTestIcons();
    // drawTestPlay();
    // infoDump();

    drawDrawerIcon();
    drawHand(0);
    // drawOpponentHand(); 

    drawEveryone();

// REMINDER:
//
// Eventually figure out how to put each card container into a hand container to move hand container.
//
//


    // stage.update();
}


function drawEveryone() {
    degrees = [];
    xpoints = [];
    ypoints = [];
    radius = (table.height - 120*Math.pow(pr,3) - 60)/2;
    centerx = table.width/2;
    centery = radius; //Add arbitrary padding from radius
    var stretch = (table.width - 80)/(radius*2);

    //For desktop.
    for (var i = 0; i < playerCount; i++) { 

        degrees.push(90 + (360/playerCount)*i);

        if (window.innerWidth > window.innerHeight) { //For desktop
            ypoints.push((radius * Math.sin(degrees[i]*2*Math.PI/360)) + centery);

            xpoints.push((stretch*(radius * Math.cos(degrees[i]*2*Math.PI/360))) + centerx);

            drawPlayer(i, xpoints[i], ypoints[i]);
        }

        else { //For mobile
            ypoints.push((radius * Math.sin(degrees[i]*2*Math.PI/360)) + centery);

            var xpoint = Math.round(radius * Math.cos(degrees[i]*2*Math.PI/360));
            console.log(xpoint);
            if (xpoint == 0) {xpoint = centerx;}
            else if (xpoint < 0) {xpoint = 30;}
            else if (xpoint > 0) {xpoint = table.width - 30;}

            xpoints.push(xpoint);

            drawPlayer(i, xpoints[i], ypoints[i]);
        }

    }
}

function drawPlayer(id, x, y) {
    var playerID = new createjs.Text(id, 48*pr + "px Roboto Condensed", "black");
    playerID.textAlign = "center";
    playerID.x = x;
    playerID.y = y;

    stage.addChild(playerID);
}

function drawTestIcons() {

    drawMiniCard("\u2665", "red", "7", 300*pr, 50);
    drawMiniCard("\u2660", "black", "Q", 400*pr, 50);
    drawMiniCardDown(500*pr, 50);
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
function drawHand(id) {
    var offset = 0;
    var handcenter = table.width/2;
    for (var i = 0; i < players[id].hand.length; i++) {
        drawCard(players[id].hand[i].suitCode, players[id].hand[i].suitColor, players[id].hand[i].cardValue, (handcenter - ((players[id].hand.length/2 +1)*40*Math.pow(pr,3))) + offset, table.height-120*pr);
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
    var originalY = y;
    var targetY = y-30*pr
    var clicked = false;

    if (pr ==1) {
        card.addEventListener("mouseover", function() {
            createjs.Tween.get(card).to({y: targetY},60);
            // card.y-=30*pr;
            // stage.update();
        });

        card.addEventListener("mouseout", function() {
            if (!clicked) {
                createjs.Tween.get(card).to({y: originalY},60);
            }
            // card.y+=30*pr;
            // stage.update();
        });

        card.addEventListener("click", function() {
            if (!clicked) {
                cardboard.shadow = new createjs.Shadow("orange", 0, 0, 20);
                createjs.Tween.get(card).to({y: targetY}, 60);
                // card.y = targetY;
                clicked = !clicked;
            } else {
                cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);
                // createjs.Tween.get(card).to({y: originalY}, 60);
                // card.y = originalY;
                clicked = !clicked;
            }
            // card.y+=30*pr;
            // card.y-=60*pr;
            // stage.update();
        });
    } else {
        card.addEventListener("click", function() {
            if (!clicked) {
                cardboard.shadow = new createjs.Shadow("orange", 0, 0, 20);
                createjs.Tween.get(card).to({y: targetY}, 60);
                clicked = !clicked;
            } else {
                cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);
                createjs.Tween.get(card).to({y: originalY}, 60);
                clicked = !clicked;
            }
        });
    }


    card.mouseChildren = false;

    stage.addChild(card);
}

function drawDrawerIcon() {
    var drawerIcon = new createjs.Text("\uE88E", (64*pr) + "px Material Icons", "white");
    drawerIcon.x = drawerIcon.y = 10;
    drawerIcon.alpha = 0.6;
    drawerIcon.on("click", function() {
        // alert("INFOOORRMATION!");
        createjs.Tween.get(drawerIcon)
        .to({alpha:1}, 100)
        .to({alpha:0.6}, 100);
    });

    stage.addChild(drawerIcon);
}

function drawDrawer() {

}

function drawDrawerCloseIcon() {

}

window.addEventListener('resize', function() {
    sizeCanvas();
    drawEverything();
});



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
