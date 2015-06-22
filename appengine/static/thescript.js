"use strict";

var table;
var context;
var stage;
var scale;

var drawer;
var players = [];
var playerCount;
var deck = [];

var handContainer;

//Player ring
var degrees;
var xpoints;
var ypoints;
var radius;
var centerx;
var centery;

var mousemove = 0;
var mousedown = 0;

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
    table = document.getElementById("table");

    if (screen.availWidth > 768) {scale = 1;}
    else {scale = 4/3;}

    sizeCanvas();
    initStage();
    initPlayer();
    initDeck();
    initHands();

    drawEverything();
}

function sizeCanvas() {
    table.width = (window.innerWidth >= 720) ? window.innerWidth : 720;
    table.height = (window.innerHeight >= 720) ? window.innerHeight : 720;
}

function initStage() {
    stage = new createjs.Stage("table");

    table.style.background = "#66BB6A";
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);
    stage.enableMouseOver(30);
    createjs.Touch.enable(stage);

    stage.on("stagemousemove", function() {
        mousemove++;
    });

    stage.on("stagemousedown", function() {
        mousedown++;
    });

    //Clicking ANYWHERE stows the drawer
    // stage.on("stagemousedown", function() {
    //     if(drawer.x==0) {
    //         createjs.Tween.get(drawer).to({x: -250*scale}, 60);
    //     }
    // });
}

function initPlayer() {
    playerCount = 8;

    for (var i = 0; i < playerCount; i++) {
        players.push(new Player(i));
    }
}

function initDeck() {
    var suit = ["spades", "diamonds", "clubs", "hearts"];
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    var points = 0;

    for (var i = 0; i < Math.floor(playerCount/2); i++) {
        for (var s = 0; s < 4; s++) {
            for (var v = 0; v <= 12; v++) {
                if (v==5 || v==10 || v==13) {
                    points = (v==5) ? 5:10;
                }
                deck.push(new Card(suit[s], names[v], v+2, false, points));
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

var Card = function(suit, name, value, isTrump, points) {
    this.suit = suit;
    this.cardName = name;
    this.cardValue = value;
    this.isTrump = isTrump;
    this.points = points;
};

function drawEverything() {
    stage.removeAllChildren();

    drawEveryone();
    drawHand(0);
    // drawOpponentHand(); 
    drawDrawerIcon();
    drawDrawer();

    //Testing methods
    // drawTestIcons();
    // drawTestPlay();
    // infoDump();
}

function drawEveryone() {
    degrees = [];
    xpoints = [];
    ypoints = [];
    radius = (table.height - 120*Math.pow(scale,3) - 60)/2;
    centerx = table.width/2;
    centery = radius;
    var stretch = (table.width - 80)/(radius*2);

    for (var i = 0; i < playerCount; i++) { 

        degrees.push(90 + (360/playerCount)*i);

        if (window.innerWidth > window.innerHeight) { //For landscape
            ypoints.push((radius * Math.sin(degrees[i]*2*Math.PI/360)) + centery);

            xpoints.push((stretch*(radius * Math.cos(degrees[i]*2*Math.PI/360))) + centerx);

            drawPlayer(i, xpoints[i], ypoints[i]);
        } else { //For portrait
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

function drawHand(id) {
    var offset = 0;
    handContainer = new createjs.Container();

    for (var i = 0; i < players[id].hand.length; i++) {
        handContainer.addChild(createHandCard(players[id].hand[i].suit, players[id].hand[i].cardName, offset, 0));
        offset += 40*Math.pow(scale,3);
    }

    handContainer.x = table.width/2 - ((players[id].hand.length-1) * 40*Math.pow(scale,3) + 120)/2;
    handContainer.y = table.height - 120*scale*scale;

    var moveCards = false;
    var restart = true;
    var shift;
    var oldX;
    
    // stage.on("stagemousedown", function() {moveCards = true; });
    // stage.on("stagemouseup", function() {moveCards = false; restart = true;});
    // stage.on("stagemousemove", function(event) {
    //     if (moveCards) {

    //         if (restart) {
    //             oldX = event.stageX;
    //             restart = false;
    //         } else {
    //                 shift = event.stageX - oldX;
    //                 if (shift > 0) {
    //                     if (handContainer.x + shift > 40) {shift = 0;}
    //                 } else {
    //                     if (handContainer.x + handContainer.getBounds().width + shift < table.width - 130) {shift = 0;}
    //                 }
    //                 handContainer.x += shift;
    //                 oldX = event.stageX;
    //         }

    //     }
    // });

    stage.on("stagemouseup", function() {table.style.background = "purple";});

    // stage.on("stagemousemove", function(event) {
    //     if (restart) {
    //         oldX = event.stageX;
    //         restart = false;
    //     } else {
    //             shift = event.stageX - oldX;
    //             if (shift > 0) {
    //                 if (handContainer.x + shift > 40) {shift = 0;}
    //             } else {
    //                 if (handContainer.x + handContainer.getBounds().width + shift < table.width - 130) {shift = 0;}
    //             }
    //             handContainer.x += shift;
    //             oldX = event.stageX;
    //     }
    // });

    stage.addChild(handContainer);
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
function drawMiniCard(suit, value, x, y) {
    var color = (suit == "diamonds" || suit == "hearts") ? "red" : "black";

    switch (suit) {
        case "spades":
            suit = "\u2660";
            break;
        case "diamonds":
            suit = "\u2666";
            break;
        case "clubs":
            suit = "\u2663";
            break;
        case "hearts":
            suit = "\u2665";
            break;
    }

    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 60*scale, 84*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var value = new createjs.Text(value, 36*scale + "px Roboto Condensed", color);
    value.textBaseline = "top";
    value.textAlign = "center";
    value.x = 30*scale;
    value.y = 5*scale;

    var suitIcon = new createjs.Text(suit, 36*scale + "px Roboto Condensed", color);
    suitIcon.textBaseline = "top";
    suitIcon.textAlign = "center";
    suitIcon.x = 30*scale;
    suitIcon.y = 5*scale + value.getMeasuredHeight();

    card.addChild(cardboard, suitIcon, value);
    card.x = x;
    card.y = y;
    stage.addChild(card);
}

//Pass in Card object as parameter and use suit and value variables to set text.
function createHandCard(suit, value, x, y) {
    var color = (suit == "diamonds" || suit == "hearts") ? "red" : "black";

    switch (suit) {
        case "spades":
            suit = "\u2660";
            break;
        case "diamonds":
            suit = "\u2666";
            break;
        case "clubs":
            suit = "\u2663";
            break;
        case "hearts":
            suit = "\u2665";
            break;
    }

    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 120*scale, 168*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var value = new createjs.Text(value, 36*scale + "px Roboto Condensed", color);
    value.textBaseline = "top";
    value.textAlign = "center";
    value.y = 10*scale;

    var suitIcon = new createjs.Text(suit, 36*scale + "px Roboto Condensed", color);
    suitIcon.textBaseline = "top";
    suitIcon.textAlign = "left";
    suitIcon.x = 5*scale;
    suitIcon.y = 10*scale + value.getMeasuredHeight();

    value.x = 5*scale + (suitIcon.getMeasuredWidth()/2);

    card.addChild(cardboard, suitIcon, value);
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
    });
    
    card.mouseChildren = false;

    // stage.addChild(card);
    return card;
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
    close.x = 250*scale-16;
    close.y = 16;

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

    var titleIcon = new createjs.Text("\uE14D", (28*scale*scale) + "px Material Icons", "#808080");
    var title = new createjs.Text("Eighty", (24*scale*scale) + "px Roboto Condensed", "black");
    titleIcon.y = title.y = 18;

    var settingsIcon = new createjs.Text("\uE8B8", (28*scale*scale) + "px Material Icons", "#808080");
    var settings = new createjs.Text("Settings", (24*scale*scale) + "px Roboto Condensed", "black");
    var helpIcon = new createjs.Text("\uE887", (28*scale*scale) + "px Material Icons", "#808080");
    var help = new createjs.Text("Help", (24*scale*scale) + "px Roboto Condensed", "black");

    settingsIcon.textBaseline = settings.textBaseline = helpIcon.textBaseline = help.textBaseline = "bottom";

    titleIcon.x = settingsIcon.x = helpIcon.x = 18*scale;
    settings.x = help.x = title.x = titleIcon.getMeasuredWidth() + 36*scale;
    settingsIcon.y = settings.y = table.height - helpIcon.getMeasuredHeight() - 36*scale;
    helpIcon.y = help.y = table.height - 18*scale;

    drawer.addChild(drawerBack, titleIcon, title, close, settingsIcon, settings, helpIcon, help);
    stage.addChild(drawer);
}

function hasMouse() {
    return mousemove > mousedown;
}

window.addEventListener('resize', function() {
    sizeCanvas();
    drawEverything();
});



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