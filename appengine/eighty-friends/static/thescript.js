"use strict";

var table;
var context;
var stage;
var animating = 0;
var scale = (screen.availWidth > 768) ? 1 : 4/3;
var fps = 60;

var tableGreen = "#66BB6A";
var mdBlue = "#03A9F4";
var mdGray = "#616161";

var players = [];
var playerCount;
var degrees;
var radius;
var centerx;
var centery;

var deck = [];
var trumpSuit;
var trumpValue;
var cardWidth = 120;
var cardHeight = 168;
var miniWidth = 60;
var miniHeight = 84;

var roundIsTractor = false;
var roundCount;
var roundSuit;

var drawer = new createjs.Container();
var drawerWidth = 300;
var handContainer = new createjs.Container();
var ascending = true;
var playButtonContainer = new createjs.Container();

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
    table = document.getElementById("table");

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

    table.style.background = tableGreen;
    createjs.Ticker.setFPS(fps);
    createjs.Ticker.addEventListener("tick", ticking);
    stage.enableMouseOver(30);
    createjs.Touch.enable(stage);
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
    radius = (table.height - cardHeight*scale)/2;
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
    this.leader = true;
    this.selectedIDs = [];
    this.selectedCards = [];
};

Player.prototype.addSelection = function(sel) {
    this.selectedIDs.push(sel.parent.getChildIndex(sel));
}

Player.prototype.removeSelection = function(sel) {
    this.selectedIDs.splice(this.selectedIDs.indexOf(sel.parent.getChildIndex(sel)),1);
}

Player.prototype.setSelectedCards = function() {
	this.selectedCards.length = 0;
	this.selectedIDs.sort(function(a, b) {return a-b;});
	for (var i = 0; i < this.selectedIDs.length; i++) {
		this.selectedCards.push(this.hand[this.selectedIDs[i]]);
	}
	this.selectedCards.sort(cardSort);
}

Player.prototype.checkSelection = function() {
	if (this.leader) {
		checkLead(this.selectedCards);
	} else {
		// checkPlay(this.selectedCards);
	}

}

Player.prototype.playCards = function() {
	animating++;
	createjs.Tween.get(playButtonContainer).to({alpha: 0}, 150).call(finishAnimating);
	// Remove from array starting at higher indexes to prevent index change errors
	for (var i = this.selectedIDs.length - 1; i >= 0; i--) {
		this.hand.splice(this.selectedIDs[i],1);
	}
	this.selectedIDs.length = 0;
	this.selectedCards.length = 0;
	drawHand();
}

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
            if (deck[i].cardValue == trumpValue) {
            	deck[i].cardValue = 16;
            }
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

    players[0].hand.sort(cardSort);
}

function calculateDiscard() {
    var discard = (playerCount == 6) ? 6 : 8;
    return discard;
}

function drawEverything() {
    stage.removeAllChildren();

    var text = new createjs.Text("Secret work!", "80px Roboto Condensed", "white");
    text.textAlign = "center";
    text.textBaseline = "midde";
    text.x = table.width/2;
    text.y = table.height/2;
    stage.addChild(text);

    // drawStart();
    // drawEveryone();
    // drawHand();
    // // drawOpponentHand();
    // drawPlayButton();
    // drawDrawerIcon();
    // drawDrawer();

    //Testing methods
    // drawTestIcons();
    // drawTestPlay();
    // infoDump();

    stage.update();
}

function drawStart() {
    var startButton = new createjs.Container();
    var startText = new createjs.Text("GO!", 36*scale + "px Roboto Condensed", "white");
    var startColor = new createjs.Shape();
    startColor.graphics.beginFill(mdBlue).drawRoundRect(0, 0, 120, 60, 10);
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
    var offset = 40*Math.pow(scale,3);
    handContainer.removeAllChildren();
    stage.addChild(handContainer);

    for (var i = 0; i < players[0].hand.length; i++) {
        handContainer.addChild(drawCard(players[0].hand[i].suit, players[0].hand[i].cardName, offset*i, 0));
    }

    handContainer.regX = ((players[0].hand.length-1)*offset + cardWidth*scale)/2;
    handContainer.regY = cardHeight*scale/2;
    handContainer.x = table.width/2;
    handContainer.y = table.height - 18*scale;

    var moveCards = false;
    var restart = true;
    var shift;
    var oldX;
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
                        if (handContainer.x - handContainer.getBounds().width/2 + shift > cardWidth) {shift = 0;}
                    } else {
                        if (handContainer.x + handContainer.getBounds().width/2 + shift < table.width - cardWidth) {shift = 0;}
                    }
                    handContainer.x += shift;
                    oldX = event.stageX;
            }
            stage.update();
        }
    });
}

function drawMiniCardDown(x, y) {
    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, miniWidth*scale, miniHeight*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var picture = new createjs.Text("\uE410", 64*scale + "px Material Icons", "lightblue");
    picture.textBaseline = "middle";
    picture.textAlign = "center";
    picture.x = miniWidth/2*scale;
    picture.y = miniHeight/2*scale;

    card.addChild(cardboard, picture);
    card.x = x;
    card.y = y;

    stage.addChild(card);
}

function drawMiniCard(suit, value, x, y) {
    var color = (suit == "diamonds" || suit == "hearts" || suit == "trump" && value == "B") ? "red" : "black";
	suit = getSuitIcon(suit);

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
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, miniWidth*scale, miniHeight*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var value = new createjs.Text(value, 36*scale + "px Roboto Condensed", color);
    value.textBaseline = "top";
    value.textAlign = "center";
    value.x = miniWidth/2*scale;
    value.y = 5*scale;

    var suitIcon = new createjs.Text(suit, 36*scale + "px Roboto Condensed", color);
    suitIcon.textBaseline = "top";
    suitIcon.textAlign = "center";
    suitIcon.x = miniWidth/2*scale;
    suitIcon.y = 5*scale + value.getMeasuredHeight();

    card.addChild(cardboard, suitIcon, value);
    card.x = x;
    card.y = y;
    stage.addChild(card);
}

function drawCardDown(x, y) {
    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, cardWidth*scale, cardHeight*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var picture = new createjs.Text("\uE410", 80*scale + "px Material Icons", "lightblue");
    picture.textBaseline = "middle";
    picture.textAlign = "center";
    picture.x = cardWidth/2*scale;
    picture.y = cardHeight/2*scale;

    card.addChild(cardboard, picture);
    card.x = x;
    card.y = y;

    return card;
}

function drawCard(suit, value, x, y) {
    var color = (suit == "diamonds" || suit == "hearts" || suit == "trump" && value == "B") ? "red" : "black";
    suit = getSuitIcon(suit);

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
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, cardWidth*scale, cardHeight*scale, 10);
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

    card.removeAllEventListeners();
    card.addEventListener("mouseover", function() {
        animating++;
        createjs.Tween.get(card).to({y: targetY},60).call(finishAnimating);
    });

    card.addEventListener("mouseout", function() {
        if (!clicked) {
            animating++;
            createjs.Tween.get(card).to({y: originalY},60).call(finishAnimating);
        }
    });

    card.addEventListener("click", function(evt) {
        if (!clicked) {
            cardboard.shadow = new createjs.Shadow(mdBlue, 0, 0, 10);
            animating++;
            createjs.Tween.get(card).to({y: targetY}, 60).call(finishAnimating);
            clicked = !clicked;
            players[0].addSelection(evt.target);

        } else {
            cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);
            animating++;
            createjs.Tween.get(card).to({y: originalY}, 60).call(finishAnimating);
            clicked = !clicked;
            players[0].removeSelection(evt.target);
        }

        if (players[0].selectedIDs.length > 0) {
            animating++;
            createjs.Tween.get(playButtonContainer).to({alpha: 1}, 150).call(finishAnimating);
        } else {
            animating++;
            createjs.Tween.get(playButtonContainer).to({alpha: 0}, 150).call(finishAnimating);
        }
    });
    card.mouseChildren = false;

    return card;
}

function drawPlayButton() {
    var playButtonText = new createjs.Text("Play", (32*scale) + "px Roboto Condensed", "white");
    playButtonText.textAlign = "center";
    playButtonText.textBaseline = "middle";
    playButtonText.x = 60*scale;
    playButtonText.y = 30*scale;
    var playButtonShape = new createjs.Shape();
    playButtonShape.graphics.beginFill(mdBlue).drawRoundRect(0, 0, 120*scale, 60*scale, 5);
    playButtonShape.shadow = new createjs.Shadow("rgba(0,0,0,0.5)", 0, 2, 1);

    playButtonContainer.addChild(playButtonShape, playButtonText);
    playButtonContainer.regX = 60*scale;
    playButtonContainer.regY = 30*scale;
    playButtonContainer.x = table.width/2;
    playButtonContainer.y = table.height/2;
    playButtonContainer.alpha = 0;
    playButtonContainer.addEventListener("mouseover", function(evt) {
		evt.target.parent.scaleX = 1.01;
		evt.target.parent.scaleY = 1.01;
		evt.target.parent.y-=1
		stage.update();
    });
    playButtonContainer.addEventListener("mouseout", function(evt) {
		evt.target.parent.scaleX = 1/1.01;
		evt.target.parent.scaleY = 1/1.01;
		evt.target.parent.y+=1
		stage.update();
    });
    playButtonContainer.addEventListener("click", function(evt) {
    	animating++;
    	createjs.Tween.get(evt.target.parent).to({alpha: 0.8}, 60).call(finishAnimating);
    	players[0].setSelectedCards();
    	players[0].checkSelection();
    });
    stage.addChild(playButtonContainer);
    stage.update();
}

function checkLead(cards) {
	var valid = true;
	console.log(cards);

	// Check if the play is a tractor if there are 4 or more cards
	if (cards.length >= 4) {
		valid = checkIsTractor(cards);
	}

	// Check for valid set plays if not tractor
	if (!roundIsTractor) {
		for (var i = 0; i < cards.length - 1; i++) {
			if (valid) {
				valid = (cards[i].suit == cards[i+1].suit) && (cards[i].cardValue == cards[i+1].cardValue);
			}
		}
	}

	if (valid) {
		roundCount = cards.length;
		roundSuit = cards[0].suit;
		players[0].playCards();
	} else {
		console.log("not valid");
	}
}

function checkPlay(cards) {
	// Check the validity of following player moves
}

function checkIsTractor(cards) {
	// Check for a valid tractor. If so, return true for valid and set roundIsTractor to true
	var setCount = 0;
	var sequenceCount = 0;
	var uniques;

	for (var i = 0; i < cards.length; i++) {
		
	}


	roundIsTractor = false;
	return true;
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
        animating++;
        createjs.Tween.get(drawerIcon)
        .to({alpha:1}, 100).call(finishAnimating);
    });
    drawerIcon.on("mouseout", function() {
        animating++;
        createjs.Tween.get(drawerIcon)
        .to({alpha:0.6}, 100).call(finishAnimating);
    })
    drawerIcon.on("click", function() {
        animating++;
        createjs.Tween.get(drawerIcon)
        .to({alpha:1}, 100)
        .to({alpha:0.6}, 100);
        createjs.Tween.get(drawer).to({x: 0}, 60).call(finishAnimating);
    });

    stage.addChild(drawerIcon);
}

function drawDrawer() {
    drawer.x = -(drawerWidth+50)*scale;

    var drawerBack = new createjs.Shape();
    drawerBack.graphics.beginFill("white").drawRect(0, 0, drawerWidth*scale, table.height);
    drawerBack.shadow = new createjs.Shadow("black", -5, 0, 50);

    var close = new createjs.Text("\uE14C", (36*scale) + "px Material Icons", "black");
    close.textAlign="right";
    close.x = drawerWidth*scale-16;
    close.y = 16;
    var closeTarget = new createjs.Shape();
    closeTarget.graphics.beginFill("white").drawRect(-close.getMeasuredWidth()-16, -16, close.getMeasuredWidth()+32, close.getMeasuredHeight()+32);
    close.hitArea = closeTarget;

    close.removeAllEventListeners();
    close.on("mouseover", function() {
        close.color = mdBlue;
        stage.update();
    });
    close.on("mouseout", function() {
        close.color = "black";
        stage.update();
    });
    close.addEventListener("click", function() {
        animating++;
        createjs.Tween.get(drawer).to({x: -(drawerWidth+50)*scale}, 60).call(finishAnimating);
    });

    var titleIcon = new createjs.Text("\uE14D", (28*scale) + "px Material Icons", mdGray);
    var title = new createjs.Text("Eighty", (24*scale) + "px Roboto Condensed", "black");
    titleIcon.y = title.y = 30*scale;

    var fullscreenIcon = new createjs.Text("\uE5D0", (28*scale) + "px Material Icons", mdGray);
    var fullscreen = new createjs.Text("Full Screen", (24*scale) + "px Roboto Condensed", "black");

    var settingsIcon = new createjs.Text("\uE8B8", (28*scale) + "px Material Icons", mdGray);
    var settings = new createjs.Text("Settings", (24*scale) + "px Roboto Condensed", "black");

    var helpIcon = new createjs.Text("\uE887", (28*scale) + "px Material Icons", mdGray);
    var help = new createjs.Text("Help", (24*scale) + "px Roboto Condensed", "black");

    fullscreenIcon.textBaseline = fullscreen.textBaseline = settingsIcon.textBaseline = settings.textBaseline = helpIcon.textBaseline = help.textBaseline = "middle";

    titleIcon.x = fullscreenIcon.x = settingsIcon.x = helpIcon.x = 30*scale;
    title.x = fullscreen.x = settings.x = help.x = titleIcon.getMeasuredWidth() + 60*scale;

    helpIcon.y = help.y = table.height - helpIcon.getMeasuredHeight() - 30*scale;
    settingsIcon.y = settings.y = helpIcon.y - settingsIcon.getMeasuredHeight() - 30*scale;
    fullscreenIcon.y = fullscreen.y = settingsIcon.y - fullscreenIcon.getMeasuredHeight() - 30*scale;

    var fullscreenTarget = new createjs.Shape();
    fullscreenTarget.graphics.beginFill("white").drawRect(-(fullscreenIcon.getMeasuredWidth()+60*scale), -fullscreenIcon.getMeasuredHeight()/2 - 8*scale, drawerWidth*scale, fullscreenIcon.getMeasuredHeight() + 16*scale);
    fullscreen.hitArea = fullscreenTarget;

    fullscreen.removeAllEventListeners();
    fullscreen.on("mouseover", function() {
        fullscreen.color = mdBlue;
        stage.update();
    });
    fullscreen.on("mouseout", function() {
        fullscreen.color = "black";
        stage.update();
    });
    fullscreen.on("click", toggleFullScreen);

    drawer.addChild(drawerBack, titleIcon, title, close, fullscreenIcon, fullscreen, settingsIcon, settings, helpIcon, help);
    drawDrawerInfo();
    stage.addChild(drawer);
}

function drawDrawerInfo() {
    var trumpSuitPic = getSuitIcon(trumpSuit);
    var trumpsColor = (trumpSuit == "diamonds" || trumpSuit == "hearts") ? "red" : "black";

    var trumpSuitIcon = new createjs.Text(trumpSuitPic, (28*scale) + "px Roboto Condensed", trumpsColor);
    var trumpSuitText = new createjs.Text("Trump suit", (24*scale) + "px Roboto Condensed", "black");
    trumpSuitIcon.x = 30*scale;
    trumpSuitText.x = trumpSuitIcon.getMeasuredWidth() + 60*scale;
    trumpSuitIcon.y = trumpSuitText.y = 120*scale;

    var trumpValueIcon = new createjs.Text(trumpValue, (28*scale) + "px Roboto Condensed", trumpsColor);
    var trumpValueText = new createjs.Text("Trump value", (24*scale) + "px Roboto Condensed", "black");
    trumpValueIcon.textAlign = "center";
    trumpValueIcon.x = 30*scale + trumpSuitIcon.getMeasuredWidth()/2;
    trumpValueText.x = trumpSuitIcon.getMeasuredWidth() + 60*scale;
    trumpValueIcon.y = trumpValueText.y = 168*scale;

    trumpSuitIcon.textBaseline = "middle";
    trumpSuitText.textBaseline = "middle";
    trumpValueIcon.textBaseline = "middle";
    trumpValueText.textBaseline = "middle";
    drawer.addChild(trumpSuitIcon, trumpSuitText, trumpValueIcon, trumpValueText);
}

function getSuitIcon(suit) {
	var code;
	switch (suit) {
        case "spades":
            code = "\u2660";
            break;
        case "diamonds":
            code = "\u2666";
            break;
        case "clubs":
            code = "\u2663";
            break;
        case "hearts":
            code = "\u2665";
            break;
    }
    return code;
}

function toggleFullScreen() {
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {

        var i = document.documentElement;

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

function ticking(event) {
    if (animating > 0) {
        stage.update();
        // console.log("stage updating");
    }
}

function finishAnimating() {
    setTimeout(function () {animating--}, Math.ceil(1000/fps));
}

window.addEventListener('resize', function() {
    sizeCanvas();
    initPlayerCoordinates();
    drawEverything();
});

function cardSort(a, b) {
	var sortFactor = (ascending) ? 1:-1;
    if (a.isTrump && !b.isTrump) {
        return 1*sortFactor;
    } else if (b.isTrump && !a.isTrump) {
        return -1*sortFactor;
    } else if (a.isTrump && b.isTrump) {
        if (a.cardValue == 15 && b.cardValue == 15) {
            if (a.suit > b.suit) {
                return 1*sortFactor;
            } else if (a.suit < b.suit) {
                return -1*sortFactor;
            } else {
                return 0;
            }
        } else {
            return (a.cardValue - b.cardValue)*sortFactor;
        }
    } else {
        if (a.suit > b.suit) {
            return 1*sortFactor;
        } else if (a.suit < b.suit) {
            return -1*sortFactor;
        } else {
            return (a.cardValue - b.cardValue)*sortFactor;
        }
    }
}

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
