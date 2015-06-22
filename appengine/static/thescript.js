"use strict";

var table;
var context;
var stage;
var scale;

var drawer;
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

var mousemove = 0;
var mousedown = 0;

if (screen.availWidth > 768) {scale = 1;}
else {scale = 4/3;}

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
    table = document.getElementById("table");

    sizeCanvas();
    initStage();
    initPlayer();
    initDeck();
    initHands();


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

function initStage() {
    stage = new createjs.Stage("table");

    table.style.background = "#66BB6A";
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
    stage.enableMouseOver(30);

    stage.on("stagemousemove", function() {
        mousemove++;
    });

    stage.on("stagemousedown", function() {
        mousedown++;
    });

    //Clicking ANYWHERE stows the drawer
    stage.on("stagemousedown", function() {
        if(drawer.x==0) {
            createjs.Tween.get(drawer).to({x: -250*scale}, 60);
        }
    });
}

function initPlayer() {
    playerCount = 5;

    for (var i = 0; i < playerCount; i++) {
        players.push(new Player(i));
    }
}

function initDeck() {
    var suit = ["spades", "diamonds", "clubs", "hearts"];
    var suitCode = ["\u2660", "\u2666", "\u2663", "\u2665"];
    var suitColor = ["black", "red", "black", "red"];
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    var points = 0;

    for (var i = 0; i < Math.floor(playerCount/2); i++) {
        for (var s = 0; s < 4; s++) {
            for (var v = 0; v <= 12; v++) {
                if (v == 5) { points = 5; }
                else if (v == 10 || v == 13) { points = 10; }
                deck.push(new Card(suit[s], suitCode[s], suitColor[s], names[v], v+2, false, points));
                points = 0;
            }
        }
    }
}

function initHands() {
    var dealID = 0;
    var cardCount = deck.length;
    for (var d = 0; d < cardCount; d++) {
        players[dealID].hand.push(deck[d]);
        dealID++;
        if (dealID >= players.length) {
            dealID = 0;
        }
    }

    // Temporary promotion of trumps and trump value

    for (var i = 0; i < players[0].hand.length; i++) {
        if (players[0].hand[i].suit == "hearts") {
            players[0].hand[i].isTrump = true;
        }
        if (players[0].hand[i].cardValue == 2) {
            players[0].hand[i].cardValue = 15;
            players[0].hand[i].isTrump = true;
        }
    }

    // Should do for player only
    players[0].hand.sort(function(a, b) {
        if (a.isTrump && !b.isTrump) {
            return 1;
        } else if (b.isTrump && !a.isTrump) {
            return -1;
        } else if (a.isTrump && b.isTrump) {
            if (a.cardValue == 15 && b.cardValue == 15) {
                if (a.suit>b.suit) {
                    return 1;
                } else if (a.suit < b.suit) {
                    return -1;
                } else {
                    return a.cardValue - b.cardValue;
                }
            } else { 
                return a.cardValue - b.cardValue;
            }
        } else {
            if (a.suit>b.suit) {
                return 1;
            } else if (a.suit < b.suit) {
                return -1;
            } else {
                return a.cardValue - b.cardValue;
            }
        }
    });
}

var Player = function(id) {
    this.id = id;
    this.hand = [];
};

var Card = function(suit, suitCode, color, name, value, isTrump, points) {
    this.suit = suit;
    this.suitCode = suitCode;
    this.suitColor = color;
    this.cardName = name;
    this.cardValue = value;
    this.isTrump = isTrump;
    this.points = points;
};

function drawEverything() {
    stage.removeAllChildren();

    //Testing methods
    // drawTestIcons();
    // drawTestPlay();
    // infoDump();

    drawHand(0);
    // drawOpponentHand(); 

    drawEveryone();

    drawDrawerIcon();
    drawDrawer();

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
    radius = (table.height - 120*Math.pow(scale,3) - 60)/2;
    centerx = table.width/2;
    centery = radius;
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
            if (xpoint == 0) {xpoint = centerx;}
            else if (xpoint < 0) {xpoint = 30;}
            else if (xpoint > 0) {xpoint = table.width - 30;}

            xpoints.push(xpoint);

            drawPlayer(i, xpoints[i], ypoints[i]);
        }

    }
}

function drawPlayer(id, x, y) {
    var playerID = new createjs.Text(id, 48*scale + "px Roboto Condensed", "black");
    playerID.textAlign = "center";
    playerID.x = x;
    playerID.y = y;

    stage.addChild(playerID);
}

function drawTestIcons() {

    drawMiniCard("\u2665", "red", "7", 300*scale, 50);
    drawMiniCard("\u2660", "black", "Q", 400*scale, 50);
    drawMiniCardDown(500*scale, 50);
}

function drawTestPlay() {
    var offset = 0;
    var arraycolor = ["black", "red", "red", "black", "red", "black"];
    var arraysuit = ["\u2663", "\u2665", "\u2666", "\u2660", "\u2665", "\u2663"];
    var arrayvalue = ["J", "A", "7", "6", "6", "Q"];
    for (var i = 0; i < 6; i++) {
        drawMiniCard(arraysuit[i], arraycolor[i], arrayvalue[i], table.width-(6*40*scale)-60+offset, 300);
        offset += 40*scale;
    }
}

//Currently a hard-coded method to demonstrate hand appearance.
function drawHand(id) {
    var offset = 0;
    var handcenter = table.width/2;
    var handContainer = new createjs.Container();
    for (var i = 0; i < players[id].hand.length; i++) {
        drawCard(players[id].hand[i].suitCode, players[id].hand[i].suitColor, players[id].hand[i].cardName, (handcenter - ((players[id].hand.length/2 +1)*40*Math.pow(scale,3))) + offset, table.height-120*scale*scale);
        offset += 40*Math.pow(scale,3);
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
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 60*scale, 84*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var picture = new createjs.Text("\uE410", 64*scale + "px Material Icons", "lightblue");
    picture.textBaseline = "top";
    picture.textAlign = "center";
    picture.x = 30*scale;
    picture.y = (84*scale - picture.getMeasuredHeight())/2;

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
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 60*scale, 84*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var value = new createjs.Text(value, 36*scale + "px Roboto Condensed", color);
    value.textBaseline = "top";
    value.textAlign = "center";
    value.x = 30*scale;
    value.y = 5*scale;

    var suit = new createjs.Text(suit, 36*scale + "px Roboto Condensed", color);
    suit.textBaseline = "top";
    suit.textAlign = "center";
    suit.x = 30*scale;
    suit.y = 5*scale + value.getMeasuredHeight();

    card.addChild(cardboard, suit, value);
    card.x = x;
    card.y = y;
    stage.addChild(card);
}

//Pass in Card object as parameter and use suit and value variables to set text.
function drawCard(suit, color, value, x, y) {
    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 120*scale, 168*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var value = new createjs.Text(value, 36*scale + "px Roboto Condensed", color);
    value.textBaseline = "top";
    value.textAlign = "center";
    value.y = 10*scale;

    var suit = new createjs.Text(suit, 36*scale + "px Roboto Condensed", color);
    suit.textBaseline = "top";
    suit.textAlign = "left";
    suit.x = 5*scale;
    suit.y = 10*scale + value.getMeasuredHeight();

    value.x = 5*scale + (suit.getMeasuredWidth()/2);

    card.addChild(cardboard, suit, value);
    card.x = x;
    card.y = y;
    var originalY = y;
    var targetY = y-30*scale
    var clicked = false;

    card.addEventListener("mouseover", function() {
        if (hasMouse()) {
            createjs.Tween.get(card).to({y: targetY},60);
        }
    });

    card.addEventListener("mouseout", function() {
        if (!clicked) {
            createjs.Tween.get(card).to({y: originalY},60);
        }
    });

    card.addEventListener("click", function() {
        if (!clicked) {
            cardboard.shadow = new createjs.Shadow("orange", 0, 0, 20);
            createjs.Tween.get(card).to({y: targetY}, 60);
            clicked = !clicked;
        } else {
            cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);
            if (!hasMouse()) {
                createjs.Tween.get(card).to({y: originalY}, 60);
            }
            clicked = !clicked;
        }
        // card.y+=30*scale;
        // card.y-=60*scale;
        // stage.update();
    });
    
    card.mouseChildren = false;

    stage.addChild(card);
}

function drawDrawerIcon() {
    var drawerIcon = new createjs.Text("\uE88E", (64*scale*scale) + "px Material Icons", "white");

    var iconTarget = new createjs.Shape();
    iconTarget.graphics.beginFill("white").drawRect(0, 0, drawerIcon.getMeasuredWidth(), drawerIcon.getMeasuredHeight());
    drawerIcon.hitArea = iconTarget;

    drawerIcon.x = drawerIcon.y = 10;
    drawerIcon.alpha = 0.6;

    drawerIcon.on("mouseover", function() {
        createjs.Tween.get(drawerIcon)
        .to({alpha:1}, 100);
    });
    drawerIcon.on("mouseout", function() {
        createjs.Tween.get(drawerIcon)
        .to({alpha:0.6}, 100);
    })

    drawerIcon.on("click", function() {
        // alert("INFOOORRMATION!");
        createjs.Tween.get(drawerIcon)
        .to({alpha:1}, 100)
        .to({alpha:0.6}, 100);
        createjs.Tween.get(drawer).to({x: 0}, 60);
    });

    stage.addChild(drawerIcon);
}

function drawDrawer() {
    drawer = new createjs.Container();
    drawer.x = -250*scale;

    var drawerBack = new createjs.Shape();
    drawerBack.graphics.beginFill("white").drawRect(0, 0, 250*scale, table.height);

    drawerBack.shadow = new createjs.Shadow("black", -5, 0, 50);

    var close = new createjs.Text("\uE14C", (36*scale*scale) + "px Material Icons", "black");
    close.textAlign="right";
    close.x = 250*scale-10;
    close.y = 10;

    var target = new createjs.Shape();
    target.graphics.beginFill("white").drawRect(-close.getMeasuredWidth()-10, -10, close.getMeasuredWidth()+20, close.getMeasuredHeight()+20);
    close.hitArea = target;

    close.on("mouseover", function() {
        close.color = "#03A9F4";
    });

    close.on("mouseout", function() {
        close.color = "black";
    });

    close.addEventListener("click", function() {
        createjs.Tween.get(drawer).to({x: -250*scale}, 60);
    });

    drawer.addChild(drawerBack, close);
    stage.addChild(drawer);
}

function hasMouse() {
    return mousemove > mousedown;
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

    var scaletext = new createjs.Text("Pixel ratio: " + scale, font, color);
    scaletext.x = 100;
    scaletext.y = 110;

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

    stage.addChild(dw, dh, scaletext, sw, sh, asw, ash);
}
