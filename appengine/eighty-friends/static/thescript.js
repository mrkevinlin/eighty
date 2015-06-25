"use strict";

var table;
var context;
var stage;
var scale;

var drawer;

var players = [];
var playerCount;
var degrees;
var radius;
var centerx;
var centery;

var deck = [];
var trumpSuit;
var trumpValue;

var handContainer;

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
    table = document.getElementById("table");

    if (screen.availWidth > 768) {scale = 1;}
    else {scale = 4/3;}


    playerCount = 5;
    trumpSuit = "hearts";
    trumpValue = 2;


    sizeCanvas();
    initStage();
    initPlayer();
    initDeck();
    initTrump();
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

    //Clicking ANYWHERE stows the drawer
    // stage.on("stagemousedown", function() {
    //     if(drawer.x==0) {
    //         createjs.Tween.get(drawer).to({x: -250*scale}, 60);
    //     }
    // });
}

function initPlayer() {
    for (var i = 0; i < playerCount; i++) {
        players.push(new Player(i));
    }

    degrees = [];
    initPlayerCoordinates();
}

function initPlayerCoordinates() {
    degrees.length = 0;
    radius = (table.height - 120*Math.pow(scale,3) - 60)/2;
    centerx = table.width/2;
    centery = radius;
    var stretch = (table.width - 80)/(radius*2);

    for (var i = 0; i < playerCount; i++) { 

        degrees.push(90 + (360/playerCount)*i);

        var xpoint = Math.round(stretch * radius * Math.cos(degrees[i]*2*Math.PI/360));
        var ypoint = (radius * Math.sin(degrees[i]*2*Math.PI/360)) + centery;

        if (window.innerWidth > window.innerHeight) { xpoint += centerx; }
        else {
            if (xpoint == 0) { xpoint = centerx; }
            else if (xpoint < 0) { xpoint = 36*scale; }
            else { xpoint = table.width - 36*scale; }
        }

        players[i].xcoord = xpoint;
        players[i].ycoord = ypoint;
    }
}

var Player = function(id) {
    this.playerID = id;
    this.hand = [];
    this.xcoord;
    this.ycoord;
};

function initDeck() {
    var suit = ["spades", "diamonds", "clubs", "hearts"];
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "I0", "J", "Q", "K", "A"];
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
        deck.push(new Card("trump", "S", 17, true, 0));
        deck.push(new Card("trump", "B", 18, true, 0));
    }

    deck = shuffle(deck);
}

var Card = function(suit, name, value, isTrump, points) {
    this.suit = suit;
    this.cardName = name;
    this.cardValue = value;
    this.isTrump = isTrump;
    this.points = points;
};

function initTrump(suit, value) {
    for (var i = 0; i < deck.length; i++) {
        if (deck[i].suit == trumpSuit) {
            deck[i].isTrump = true;
        }
        if (deck[i].cardValue == trumpValue) {
            deck[i].cardValue = 15;
            deck[i].isTrump = true;
        }
    }
}

function initHands() {
    var dealID = 0;
    var cardCount = deck.length - calculateDiscard();
    for (var d = 0; d < cardCount; d++) {
        players[dealID].hand.push(deck[d]);
        dealID++;
        if (dealID >= players.length) {
            dealID = 0;
        }
    }

    players[0].hand.sort(function(a, b) {
        if (a.isTrump && !b.isTrump) {
            return 1;
        } else if (b.isTrump && !a.isTrump) {
            return -1;
        } else if (a.isTrump && b.isTrump) {
            if (a.cardValue == 15 && b.cardValue == 15) {
                if (a.suit > b.suit) {
                    return 1;
                } else if (a.suit < b.suit) {
                    return -1;
                } else {
                    return 0;
                }
            } else { 
                return a.cardValue - b.cardValue;
            }
        } else {
            if (a.suit > b.suit) {
                return 1;
            } else if (a.suit < b.suit) {
                return -1;
            } else {
                return a.cardValue - b.cardValue;
            }
        }
    });
}

function calculateDiscard() {
    var discard = (playerCount == 6) ? 6 : 8;
    return discard;
}

function drawEverything() {
    stage.removeAllChildren();

    drawStart();
    drawEveryone();
    drawHand();
    // drawOpponentHand(); 
    drawDrawerIcon();
    drawDrawer();

    //Testing methods
    // drawTestIcons();
    // drawTestPlay();
    // infoDump();
}

function drawStart() {
    var startButton = new createjs.Container();
    var startText = new createjs.Text("GO!", 36*scale + "px Roboto Condensed", "white");
    var startColor = new createjs.Shape();
    startColor.graphics.beginFill("#03A9F4").drawRoundRect(0, 0, 120, 60, 10);
    startText.textAlign = "center";
    startText.textBaseline = "middle";
    startText.x = 120/2;
    startText.y = 60/2;

    startButton.addChild(startColor, startText);
    startButton.x = table.width - 220;
    startButton.y = 100;

    // startButton.addEventListener("click", animateDeal);

    stage.addChild(startButton);
}

function animateDeal() {
    var startx = centerx;
    var starty = 0;
    for (var i = 0; i < playerCount; i++) {
        var dealt = drawCardDown(startx, starty);
        stage.addChild(dealt);
        createjs.Tween.get(dealt).to({x: players[i].xcoord, y: players[i].ycoord}, 300).call(function() {stage.removeChild(dealt);});
    }
}

function drawEveryone() {
    for (var i = 0; i < playerCount; i++) { 
            drawPlayer(players[i].playerID, players[i].xcoord, players[i].ycoord);
    }
}

function drawPlayer(id, x, y) {
    var playerID = new createjs.Text(id, 48*scale + "px Roboto Condensed", "black");
    playerID.textAlign = "center";
    playerID.x = x;
    playerID.y = y;

    stage.addChild(playerID);
}

function drawHand() {
    var offset = 0;
    handContainer = new createjs.Container();
    stage.addChild(handContainer);

    for (var i = 0; i < players[0].hand.length; i++) {
        handContainer.addChild(drawCard(players[0].hand[i].suit, players[0].hand[i].cardName, offset, 0));
        offset += 40*Math.pow(scale,3);
    }

    handContainer.x = table.width/2 - ((players[0].hand.length-1) * 40*Math.pow(scale,3) + 120)/2;
    handContainer.y = table.height - 120*scale*scale;


    var moveCards = false;
    var restart = true;
    var shift;
    var oldX;

    // NOTE: REMOVED ALL EVENT LISTENERS FOR STAGE HERE (in case more listeners are added to stage in the future and I forget about this)
    stage.removeAllEventListeners();
    stage.on("stagemousedown", function() {moveCards = true; });
    stage.on("stagemouseup", function() {moveCards = false; restart = true;});
    stage.on("stagemousemove", function(event) {
        if (moveCards) {
            if (restart) {
                oldX = event.stageX;
                restart = false;
            } else {
                    shift = event.stageX - oldX;
                    if (shift > 0) {
                        if (handContainer.x + shift > 40) {shift = 0;}
                    } else {
                        if (handContainer.x + handContainer.getBounds().width + shift < table.width - 130) {shift = 0;}
                    }
                    handContainer.x += shift;
                    oldX = event.stageX;
            }

        }
    });
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
    picture.textBaseline = "middle";
    picture.textAlign = "center";
    picture.x = 30*scale;
    picture.y = 42*scale;

    card.addChild(cardboard, picture);
    card.x = x;
    card.y = y;
    
    stage.addChild(card);
}

//Save suit (unicode), value, and color variables in Card objects and consolidate those parameters
//into a single Card object in this function. Pass in coordinates to start draw on.
function drawMiniCard(suit, value, x, y) {
    var color = (suit == "diamonds" || suit == "hearts" || suit == "trump" && value == "B") ? "red" : "black";

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

    switch (value) {
        case "B":
            suit = "\u2605";
            break;
        case "S":
            suit = "\u2606";
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

function drawCardDown(x, y) {
    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, 120*scale, 168*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var picture = new createjs.Text("\uE410", 80*scale + "px Material Icons", "lightblue");
    picture.textBaseline = "middle";
    picture.textAlign = "center";
    picture.x = 60*scale;
    picture.y = 84*scale;

    card.addChild(cardboard, picture);
    card.x = x;
    card.y = y;
    
    return card;
}

//Pass in Card object as parameter and use suit and value variables to set text.
function drawCard(suit, value, x, y) {
    var color = (suit == "diamonds" || suit == "hearts" || suit == "trump" && value == "B") ? "red" : "black";

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

    switch (value) {
        case "B":
            suit = "\u2605";
            break;
        case "S":
            suit = "\u2606";
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
        createjs.Tween.get(card).to({y: targetY},60);
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
            createjs.Tween.get(card).to({y: originalY}, 60);
            clicked = !clicked;
        }
    });
    
    card.mouseChildren = false;

    return card;
}

function drawDrawerIcon() {
    var drawerIcon = new createjs.Text("\uE88E", (64*scale*scale) + "px Material Icons", "white");

    var iconTarget = new createjs.Shape();
    iconTarget.graphics.beginFill("white").drawRect(0, 0, drawerIcon.getMeasuredWidth(), drawerIcon.getMeasuredHeight());
    drawerIcon.hitArea = iconTarget;

    drawerIcon.x = drawerIcon.y = 10;
    drawerIcon.alpha = 0.6;

    drawerIcon.removeAllEventListeners();
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
    var closeTarget = new createjs.Shape();
    closeTarget.graphics.beginFill("white").drawRect(-close.getMeasuredWidth()-16, -16, close.getMeasuredWidth()+32, close.getMeasuredHeight()+32);
    close.hitArea = closeTarget;

    close.removeAllEventListeners();
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

    var fullscreenIcon = new createjs.Text("\uE5D0", (28*scale*scale) + "px Material Icons", "#808080");
    var fullscreen = new createjs.Text("Full Screen", (24*scale*scale) + "px Roboto Condensed", "black");

    var settingsIcon = new createjs.Text("\uE8B8", (28*scale*scale) + "px Material Icons", "#808080");
    var settings = new createjs.Text("Settings", (24*scale*scale) + "px Roboto Condensed", "black");

    var helpIcon = new createjs.Text("\uE887", (28*scale*scale) + "px Material Icons", "#808080");
    var help = new createjs.Text("Help", (24*scale*scale) + "px Roboto Condensed", "black");

    fullscreenIcon.textBaseline = fullscreen.textBaseline = settingsIcon.textBaseline = settings.textBaseline = helpIcon.textBaseline = help.textBaseline = "middle";

    titleIcon.x = fullscreenIcon.x = settingsIcon.x = helpIcon.x = 18*scale;
    title.x = fullscreen.x = settings.x = help.x = titleIcon.getMeasuredWidth() + 36*scale;

    helpIcon.y = help.y = table.height - helpIcon.getMeasuredHeight();
    settingsIcon.y = settings.y = helpIcon.y - settingsIcon.getMeasuredHeight() - 18*scale;
    fullscreenIcon.y = fullscreen.y = settingsIcon.y - fullscreenIcon.getMeasuredHeight() - 18*scale;


    var fullscreenTarget = new createjs.Shape();
    fullscreenTarget.graphics.beginFill("white").drawRect(-(fullscreenIcon.getMeasuredWidth()+36*scale), -fullscreenIcon.getMeasuredHeight()/2 - 8*scale, 250*scale, fullscreenIcon.getMeasuredHeight() + 16*scale);
    fullscreen.hitArea = fullscreenTarget;

    fullscreen.removeAllEventListeners();
    fullscreen.on("mouseover", function() {
        fullscreen.color = "#03A9F4";
    });
    fullscreen.on("mouseout", function() {
        fullscreen.color = "black";
    });
    fullscreen.on("click", toggleFullScreen);

    drawer.addChild(drawerBack, titleIcon, title, close, fullscreenIcon, fullscreen, settingsIcon, settings, helpIcon, help);
    drawDrawerInfo();
    stage.addChild(drawer);
}

function drawDrawerInfo() {
    var trumpSuitPic;
    var trumpsColor = (trumpSuit == "diamonds" || trumpSuit == "hearts") ? "red" : "black";
    switch (trumpSuit) {
        case "spades":
            trumpSuitPic = "\u2660";
            break;
        case "diamonds":
            trumpSuitPic = "\u2666";
            break;
        case "clubs":
            trumpSuitPic = "\u2663";
            break;
        case "hearts":
            trumpSuitPic = "\u2665";
            break;
    }

    var trumpSuitIcon = new createjs.Text(trumpSuitPic, (28*scale*scale) + "px Roboto Condensed", trumpsColor);
    var trumpSuitText = new createjs.Text("Trump suit", (24*scale*scale) + "px Roboto Condensed", "black");
    trumpSuitIcon.x = 18*scale;
    trumpSuitText.x = trumpSuitIcon.getMeasuredWidth() + 36*scale;
    trumpSuitIcon.y = trumpSuitText.y = 120*scale;

    var trumpValueIcon = new createjs.Text(trumpValue, (28*scale*scale) + "px Roboto Condensed", trumpsColor);
    var trumpValueText = new createjs.Text("Trump value", (24*scale*scale) + "px Roboto Condensed", "black");
    trumpValueIcon.textAlign = "center";
    trumpValueIcon.x = 18*scale + trumpSuitIcon.getMeasuredWidth()/2;
    trumpValueText.x = trumpSuitIcon.getMeasuredWidth() + 36*scale;
    trumpValueIcon.y = trumpValueText.y = 168*scale;

    trumpSuitIcon.textBaseline = trumpSuitText.textBaseline = trumpValueIcon.textBaseline = trumpValueText.textBaseline = "middle";
    drawer.addChild(trumpSuitIcon, trumpSuitText, trumpValueIcon, trumpValueText);
}

function toggleFullScreen() {
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {

        var i = document.getElementById("table");
 
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        } else {
            if (i.requestFullscreen) {
                i.requestFullscreen();
            } else if (i.webkitRequestFullscreen) {
                i.webkitRequestFullscreen();
            } else if (i.mozRequestFullScreen) {
                i.mozRequestFullScreen();
            } else if (i.msRequestFullscreen) {
                i.msRequestFullscreen();
            }
        }
    }
}

window.addEventListener('resize', function() {
    sizeCanvas();
    initPlayerCoordinates();
    drawEverything();
});

function shuffle(array) {
    var counter = array.length, temp, index;

    while (counter > 0) {
        index = Math.floor(Math.random() * counter);

        counter--;

        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
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