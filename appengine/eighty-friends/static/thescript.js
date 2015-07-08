"use strict";

var table;
var context;
var stage;
var animating = 0;
var scale = (screen.availWidth > 768) ? 1 : 4/3;
var fps = 60

var tableGreen = "#66BB6A";
var mdBlue = "#03A9F4";
var mdGray = "#616161";
var mdOrange = "#FF9800";

var players = [];
var playerCount;
var degrees;
var radius;
var centerx;
var centery;

var handContainer = new createjs.Container();
var playButtonContainer = new createjs.Container();
var playContainer = new createjs.Container();

var deck = [];
var trumpSuit;
var trumpValue;
var cardWidth = 120;
var cardHeight = 168;
var miniWidth = 60;
var miniHeight = 84;

var roundIsTractor;
var tractorSetCount;
var roundCount;
var roundSuit;
var roundIsTrump;

var teamsSet;
var drawer = new createjs.Container();
var drawerWidth = 300;
var dpx = 48; // drawerPaddingX
var dpy = 48; // drawerPaddingY
var trumpInfoY;
var scoreInfoY;
var scoreTeamY;
var defendTeamY;

var ascending = true;

WebFont.load({
    google: {
      families: ['Roboto Condensed', 'Material Icons']
    }
  });

function init() {
    table = document.getElementById("table");

    playerCount = 7;
    trumpSuit = "hearts";
    trumpValue = 4;
    teamsSet = false;
    ascending = true;

    sizeCanvas();
    initStage();
    initPlayer();
    initDeck();
    initTrump();
    initHands();

    drawEverything();
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

        players[i].defending = (i%3==0) ? true:false;
        if(i%3==0) {players[i].level = 3;}
        else if(i%2==0) {players[i].level = 2;}
        else {players[i].level = "I0";}
        players[i].points = 150*i;
    }
    players[0].leader = true;

    degrees = [];
    initPlayerCoordinates();
}

function initPlayerCoordinates() {
    degrees.length = 0;
    radius = (table.height - cardHeight*scale*scale - 64*scale)/2;
    centerx = table.width/2;
    centery = radius + 64*scale;
    var stretch = (table.width - 108)/(radius*2);

    for (var i = 0; i < playerCount; i++) {

        degrees.push(90 + (360/playerCount)*i);

        var xpoint = Math.round(stretch * radius * Math.cos(degrees[i]*2*Math.PI/360));
        var ypoint = (radius * Math.sin(degrees[i]*2*Math.PI/360)) + centery;

        if (window.innerWidth > window.innerHeight) { xpoint += centerx; }
        else {
            if (xpoint == 0) { xpoint = centerx; }
            else if (xpoint < 0) { xpoint = 80*scale; }
            else { xpoint = table.width - 80*scale; }
        }

        players[i].xcoord = xpoint;
        players[i].ycoord = ypoint;
    }
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

function initTrump() {
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
    var discard = (playerCount == 6) ? 6 : 8;
    var cardCount = deck.length - discard;
    for (var d = 0; d < cardCount; d++) {
        players[dealID].hand.push(deck[d]);
        dealID++;
        if (dealID >= players.length) {
            dealID = 0;
        }
    }

    players[0].hand.sort(cardSort);
}

var Player = function(id) {
    this.playerID = id;
    this.hand = [];
    this.xcoord;
    this.ycoord;
    this.leader;
    this.defending;
    this.level;
    this.points;
    this.numCardsSelected = 0;
    this.selectedCards = [];
};

//Player.prototype.addSelection = function(sel) {
    //this.selectedCards.push(sel);
//}

//Player.prototype.removeSelection = function(sel) {
    //this.selectedCards.splice(this.selectedCards.indexOf(sel),1);
//}

Player.prototype.checkSelection = function() {
    for (var i = 0; i < this.hand.length; i++) {
        var card = this.hand[i];
        if (card.isSelected) {
            card.isSelected = false;
            this.selectedCards.push(card);
        }
    }

    if (this.leader) {
        checkLead(this.selectedCards);
    } else {
        // checkPlay(this.selectedCards);
    }
}

Player.prototype.clearSelection = function() {
    this.selectedCards.length = 0;
    console.log("CLEARED");
}

Player.prototype.playCards = function() {
    animating++;
    createjs.Tween.get(playButtonContainer).to({alpha: 0}, 150).call(finishAnimating);

    var animateToPoint = handContainer.globalToLocal(table.width/2-(((this.selectedCards.length-1)*50*scale + miniWidth*scale)/2), (players[0].ycoord - miniHeight*scale - 64));
    var drawPoint = handContainer.localToGlobal(animateToPoint.x, animateToPoint.y);
    stage.addChild(playContainer);
    playContainer.removeAllChildren();
    playContainer.x = drawPoint.x;
    playContainer.y = drawPoint.y;
    for (var i = this.selectedCards.length-1; i >= 0; i--) {
        var card = this.selectedCards[i];
        var handCard = handContainer.getChildAt(this.hand.indexOf(card));
        animating++;
        createjs.Tween.get(handCard)
        .to({scaleX: .5, scaleY: .5, x: animateToPoint.x + 50*scale*i, y: animateToPoint.y}, 200, createjs.Ease.cubicOut)
        .call(finishAnimating)
        .call(drawPlayCard, [card, i], this);
        // TODO: Make enum for card children 0=cardboard, 1=suitIcon, 2=value
        // these animations take into account the container scaling, i.e. multiplies by 2
        animating++;
        var cardboard = handCard.getChildAt(0);
        createjs.Tween.get(cardboard.graphics.command)
        .to({radiusBL:20, radiusBR:20, radiusTL:20, radiusTR:20}, 200, createjs.Ease.cubicOut)
        .call(finishAnimating);
        animating++;
        var value = handCard.getChildAt(2);
        createjs.Tween.get(value)
        .to({scaleX: 2, scaleY: 2, x: cardWidth/2*scale, y: 5*scale}, 200, createjs.Ease.cubicOut)
        .call(finishAnimating);
        animating++;
        var suitIcon = handCard.getChildAt(1);
        createjs.Tween.get(suitIcon)
        .to({scaleX: 2, scaleY: 2, x: cardWidth/2*scale, y: 2*(5*scale + value.getMeasuredHeight())}, 200, createjs.Ease.cubicOut)
        .call(finishAnimating);
    }

    function drawPlayCard(card, i) {
        playContainer.addChild(drawMiniCard(card.suit, card.cardName, 50*scale*i, 0));
        this.hand.splice(this.hand.indexOf(card),1);
        this.selectedCards.splice(this.selectedCards.length-1,1);
        if (this.selectedCards.length === 0) {
            drawHand();
            this.numCardsSelected = 0;
        }
    }
}

var Card = function(suit, name, value, isTrump, points) {
    this.suit = suit;
    this.cardName = name;
    this.cardValue = value;
    this.isTrump = isTrump;
    this.points = points;
    this.isSelected = false;
};

function drawEverything() {
    stage.removeAllChildren();

    // drawStartButton();
    drawEveryone();
    drawHand();
    // drawOpponentHand();
    drawPlayButton();
    drawDrawerIcon();
    drawDrawer();

    stage.update();
}

function drawStartButton() {
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

function drawEveryone() {
    for (var i = 0; i < playerCount; i++) {
            drawPlayer(players[i].playerID, players[i].xcoord, players[i].ycoord);
    }
}

function drawPlayer(id, x, y) {
    var playerContainer = new createjs.Container();
    playerContainer.removeAllChildren();

    var badgeShadow = new createjs.Shadow("rgba(0, 0, 0, 0.5)", 0, 2, 5);

    var avatar = new createjs.Shape();
    avatar.graphics.beginFill(mdBlue).drawCircle(0,0,42*scale);
    avatar.set({shadow: badgeShadow});
    playerContainer.addChild(avatar);

    var levelCircle = new createjs.Shape();
    levelCircle.graphics.beginFill(mdOrange).drawCircle(0,0,16*scale);
    levelCircle.set({shadow: badgeShadow, x: 32*scale, y: -32*scale});

    var level = new createjs.Text(players[id].level, 26*scale + "px Roboto Condensed", "white");
    level.set(centerText());
    level.set({x: 32*scale, y: -32*scale});
    playerContainer.addChild(levelCircle, level);

    if (players[id].defending) {
        var teamDefense = new createjs.Text("\uE32A", 36*scale + "px Material Icons", "white");
        teamDefense.set(centerText());
        teamDefense.shadow = badgeShadow;
        teamDefense.x = (-12-teamDefense.getMeasuredWidth()/2)*scale;
        teamDefense.y = (12+teamDefense.getMeasuredHeight()/2)*scale;
        playerContainer.addChild(teamDefense);
    } else if (!teamsSet) {
        var pointRect = new createjs.Shape();
        var point = new createjs.Text(players[id].points, 26*scale + "px Roboto Condensed", mdGray);
        point.set(centerText());
        pointRect.graphics.beginFill("white").drawRoundRect(0, 0, point.getMeasuredWidth()+18*scale, point.getMeasuredHeight()+8*scale, 5);
        pointRect.shadow = badgeShadow;
        pointRect.regX = (point.getMeasuredWidth()+18*scale)/2;
        pointRect.regY = (point.getMeasuredHeight()+8*scale)/2;

        point.x = pointRect.x = 28*scale;
        point.y = pointRect.y = 28*scale;
        playerContainer.addChild(pointRect, point);
    // } else {
        // var teamScore = new createjs.Text("\uE3B8", 36*scale + "px Material Icons", "white");
     //    teamScore.textAlign = "center";
     //    teamScore.textBaseline = "middle";
     //    teamScore.shadow = new createjs.Shadow(mdGray, 0, 2, 5);
     //    teamScore.x = (-12-teamScore.getMeasuredWidth()/2)*scale;
     //    teamScore.y = (12+teamScore.getMeasuredHeight()/2)*scale;
     //    teamScore.rotation = 180;
     //    playerContainer.addChild(teamScore);
    }

    playerContainer.x = x;
    playerContainer.y = y;

    stage.addChild(playerContainer);
}

function drawHand() {
    var offset = 40*Math.pow(scale,3);
    handContainer.removeAllChildren();
    stage.addChild(handContainer);

    for (var i = 0; i < players[0].hand.length; i++) {
        handContainer.addChild(drawCard(players[0].hand[i], offset*i, 0));
    }

    handContainer.regX = ((players[0].hand.length-1)*offset + cardWidth*scale)/2;
    handContainer.regY = cardHeight*scale/2;
    handContainer.x = table.width/2;
    handContainer.y = table.height - 24*scale*scale;

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
    picture.set(centerText());
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
    cardboard.shadow = new createjs.Shadow(mdGray, 0, 1, 2);

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

    return card;
}

function drawCardDown(x, y) {
    var card = new createjs.Container();

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, cardWidth*scale, cardHeight*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var picture = new createjs.Text("\uE410", 80*scale + "px Material Icons", "lightblue");
    picture.set(centerText());
    picture.x = cardWidth/2*scale;
    picture.y = cardHeight/2*scale;

    card.addChild(cardboard, picture);
    card.x = x;
    card.y = y;

    return card;
}

function drawCard(card, x, y) {
    var suit = card.suit;
    var value = card.cardName;
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

    var cardContainer = new createjs.Container();
    cardContainer.cardObj = card;

    var cardboard = new createjs.Shape();
    cardboard.graphics.beginFill('white').drawRoundRect(0, 0, cardWidth*scale, cardHeight*scale, 10);
    cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);

    var value = new createjs.Text(value, 36*scale + "px Roboto Condensed", color);
    value.textBaseline = "top";
    value.textAlign = "center";
    value.y = 10*scale;

    var suitIcon = new createjs.Text(suit, 36*scale + "px Roboto Condensed", color);
    suitIcon.textBaseline = "top";
    suitIcon.textAlign = "center";
    suitIcon.y = 10*scale + value.getMeasuredHeight();

    value.x = 5*scale + (suitIcon.getMeasuredWidth()/2);
    suitIcon.x = 5*scale + (suitIcon.getMeasuredWidth()/2);

    cardContainer.addChild(cardboard, suitIcon, value);
    cardContainer.x = x;
    cardContainer.y = y;
    var originalY = y;
    var targetY = y-30*scale
    var clicked = false;

    cardContainer.removeAllEventListeners();
    cardContainer.addEventListener("mouseover", function() {
        animating++;
        createjs.Tween.get(cardContainer).to({y: targetY},60).call(finishAnimating);
    });

    cardContainer.addEventListener("mouseout", function() {
        if (!clicked) {
            animating++;
            createjs.Tween.get(cardContainer).to({y: originalY},60).call(finishAnimating);
        }
    });

    cardContainer.addEventListener("click", function(evt) {
        if (!clicked) {
            cardboard.shadow = new createjs.Shadow(mdBlue, 0, 0, 10);
            animating++;
            createjs.Tween.get(cardContainer).to({y: targetY}, 60).call(finishAnimating);
            players[0].numCardsSelected++;
        } else {
            cardboard.shadow = new createjs.Shadow("black", 0, 1, 2);
            animating++;
            createjs.Tween.get(cardContainer).to({y: originalY}, 60).call(finishAnimating);
            players[0].numCardsSelected--;
        }

        clicked = !clicked;
        evt.target.cardObj.isSelected = clicked;

        if (players[0].numCardsSelected > 0) {
            animating++;
            createjs.Tween.get(playButtonContainer).to({alpha: 1}, 150).call(finishAnimating);
        } else {
            animating++;
            createjs.Tween.get(playButtonContainer).to({alpha: 0}, 150).call(finishAnimating);
        }
    });
    cardContainer.mouseChildren = false;

    return cardContainer;
}

function drawPlayButton() {
	playButtonContainer.removeAllChildren();
    var playButtonText = new createjs.Text("Play", (32*scale) + "px Roboto Condensed", "white");
    playButtonText.set(centerText());
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
    playButtonContainer.removeAllEventListeners();
  //   playButtonContainer.addEventListener("mouseover", function(evt) {
        // evt.target.parent.scaleX = 1.01;
        // evt.target.parent.scaleY = 1.01;
        // evt.target.parent.y-=1
        // stage.update();
  //   });
  //   playButtonContainer.addEventListener("mouseout", function(evt) {
        // evt.target.parent.scaleX = 1/1.01;
        // evt.target.parent.scaleY = 1/1.01;
        // evt.target.parent.y+=1
        // stage.update();
  //   });
    playButtonContainer.addEventListener("click", function(evt) {
        animating++;
        createjs.Tween.get(evt.target.parent).to({alpha: 0.8}, 60).call(finishAnimating);
        players[0].checkSelection();
    });
    stage.addChild(playButtonContainer);
    stage.update();
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

    stage.on("stagemousedown", function(evt) {
        if (evt.stageX > drawerWidth && drawer.x >= 0) {
            animating++;
            createjs.Tween.get(drawer).to({x: -(drawerWidth+50)*scale}, 60).call(finishAnimating);
        }
    });

    stage.addChild(drawerIcon);
}

// Todo: Come up with good ways to pad elements vertically in the drawer. Currently hardcoded. (Pass heights/y values into subsequent draw methods?).
// 
// Also use consistent paddings for x values, not measuredWidths(). Jeeeeeeez

function drawDrawer() {
    drawer.removeAllChildren();
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
    var titleText = new createjs.Text("Eighty", (24*scale) + "px Roboto Condensed", "black");
    titleIcon.textBaseline = titleText.textBaseline = "middle";
    titleIcon.y = titleText.y = dpy*scale;

    var settingsIcon = new createjs.Text("\uE8B8", (28*scale) + "px Material Icons", mdGray);
    var settingsText = new createjs.Text("Settings", (24*scale) + "px Roboto Condensed", "black");

    var helpIcon = new createjs.Text("\uE887", (28*scale) + "px Material Icons", mdGray);
    var helpText = new createjs.Text("Help", (24*scale) + "px Roboto Condensed", "black");

    titleIcon.textAlign = settingsIcon.textAlign = helpIcon.textAlign = "center";
    helpIcon.textBaseline = helpText.textBaseline = settingsIcon.textBaseline = settingsText.textBaseline = "middle";

    titleIcon.x = settingsIcon.x = helpIcon.x = dpx*scale;
    titleText.x = settingsText.x = helpText.x = dpx*2*scale;

    helpIcon.y = helpText.y = table.height - (dpy*scale);
    settingsIcon.y = settingsText.y = helpIcon.y - (dpy*scale);

    drawer.addChild(drawerBack, titleIcon, titleText, close, settingsIcon, settingsText, helpIcon, helpText);
    trumpInfoY = titleText.y + titleText.getMeasuredHeight();
    drawDrawerInfo();
    stage.addChild(drawer);
}

function drawDrawerInfo() {
    drawTrumpInfo();
    drawScore();
    drawScoreTeam();
    drawDefendTeam();
}

function drawTrumpInfo() {
    var trumpSuitPic = getSuitIcon(trumpSuit);
    var trumpsColor = (trumpSuit == "diamonds" || trumpSuit == "hearts") ? "red" : "black";

    var trumpSuitIcon = new createjs.Text(trumpSuitPic, (28*scale) + "px Roboto Condensed", trumpsColor);
    var trumpSuitText = new createjs.Text("Trump suit", (24*scale) + "px Roboto Condensed", "black");
    trumpSuitIcon.textAlign = "center";
    trumpSuitIcon.textBaseline = trumpSuitText.textBaseline = "middle";
    trumpSuitIcon.x = dpx*scale;
    trumpSuitText.x = dpx*2*scale;
    trumpSuitIcon.y = trumpSuitText.y = trumpInfoY + (dpy*scale);

    var trumpValueIcon = new createjs.Text(trumpValue, (28*scale) + "px Roboto Condensed", trumpsColor);
    var trumpValueText = new createjs.Text("Trump value", (24*scale) + "px Roboto Condensed", "black");
    trumpValueIcon.textAlign = "center";
    trumpValueIcon.textBaseline = trumpValueText.textBaseline = "middle";
    trumpValueIcon.x = dpx*scale;
    trumpValueText.x = dpx*2*scale;
    trumpValueIcon.y = trumpValueText.y = trumpSuitIcon.y + dpy*scale;

    trumpSuitIcon.textBaseline = "middle";
    trumpSuitText.textBaseline = "middle";
    trumpValueIcon.textBaseline = "middle";
    trumpValueText.textBaseline = "middle";

    drawer.addChild(trumpSuitIcon, trumpSuitText, trumpValueIcon, trumpValueText);

    scoreInfoY = trumpValueIcon.y + trumpValueIcon.getMeasuredHeight()/2;
}

function drawScore() {
    var scoreIcon = new createjs.Text("\uE147", (28*scale) + "px Material Icons", mdOrange);
    var scoreText = new createjs.Text("Score:", (24*scale) + "px Roboto Condensed", "black");
    scoreIcon.textAlign = "center";
    scoreIcon.textBaseline = scoreText.textBaseline = "middle";
    scoreIcon.x = dpx*scale;
    scoreText.x = dpx*2*scale;
    scoreIcon.y = scoreText.y = scoreInfoY + dpy*1.2*scale;

    scoreTeamY = scoreIcon.y + scoreIcon.getMeasuredHeight()/2;

    drawer.addChild(scoreIcon, scoreText);
}

function drawScoreTeam() {
    var scoreTeamIcon = new createjs.Text("\uE3B8", (28*scale) + "px Material Icons", mdGray);
    scoreTeamIcon.rotation = 180;
    var scoreTeamText = new createjs.Text("Scoring Team", (24*scale) + "px Roboto Condensed", "black");
    scoreTeamIcon.textAlign = "center";
    scoreTeamIcon.textBaseline = scoreTeamText.textBaseline = "middle";

    scoreTeamIcon.x = dpx*scale;
    scoreTeamText.x = dpx*2*scale;
    scoreTeamIcon.y = scoreTeamText.y = scoreTeamY + dpy*1.2*scale;

    var scoreTeamContainer = drawTeamList(false);
    scoreTeamContainer.x = dpx*scale;
    scoreTeamContainer.y = scoreTeamIcon.y + dpy*scale;

    // Change to last person on scoring team list
    defendTeamY = scoreTeamContainer.y;
     // + scoreTeamContainer.getBounds().height;

    drawer.addChild(scoreTeamIcon, scoreTeamText, scoreTeamContainer);
}

function drawDefendTeam() {
    var defendTeamIcon = new createjs.Text("\uE32A", (28*scale) + "px Material Icons", mdGray);
    var defendTeamText = new createjs.Text("Defending Team", (24*scale) + "px Roboto Condensed", "black");

    defendTeamIcon.textAlign = "center";
    defendTeamIcon.textBaseline = defendTeamText.textBaseline = "middle";
    defendTeamIcon.x = dpx*scale;
    defendTeamText.x = dpx*2*scale;
    defendTeamIcon.y = defendTeamText.y = defendTeamY + dpy*1.2*scale;

    drawer.addChild(defendTeamIcon, defendTeamText);
}

function drawTeamList(defending) {
    var teamContainer = new createjs.Container();

    return teamContainer;
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

function checkLead(cards) {
    var valid = true;

    // // Check if the play is a tractor if there are 4 or more cards
    // if (cards.length >= 4) {
    //     valid = checkTractor(cards);
    //     roundIsTractor = valid;
    // }

    // // Check for valid set plays if not tractor
    // if (!roundIsTractor) {
    //     for (var i = 0; i < cards.length - 1; i++) {
    //         if (valid) {
    //             valid = (cards[i].suit == cards[i+1].suit) && (cards[i].cardValue == cards[i+1].cardValue);
    //         }
    //     }
    // }

    if (valid) {
        console.log("IS GOOD");
        roundCount = cards.length;
        roundSuit = cards[0].suit;
        roundIsTrump = cards[0].isTrump;
        players[0].playCards();
    } else {
        console.log("not valid");
    }
}

function checkPlay(cards) {
    // Check the validity of following player moves
}

function checkTractor(cards) {
    // Find the number of cards in each tractor set (ie pairs, triples, etc)
    var setCount = 0;
    do {setCount++;} 
    while (cards[setCount-1].suit == cards[setCount].suit 
        && cards[setCount-1].cardValue == cards[setCount].cardValue)
    // console.log("Set count: " + setCount);

    // The set must be a pair at minimum and the play must have whole numbers of sets
    if (setCount > 1 && cards.length%setCount==0) {
        // Check that the first cards in each set are the same suit and sequential
        for (var i = 0; i < cards.length - setCount; i+=setCount) {
            // Sequence set suits must match OR they must all be trumps
            if (cards[i].suit == cards[i+setCount].suit || (cards[i].isTrump && cards[i+setCount].isTrump)) {
                // Account for extraction of trump value from sequences
                if (cards[i].cardValue+1 == trumpValue) {
                    if (cards[i].cardValue + 2 != cards[i+setCount].cardValue) {
                        // console.log("Not sequential sets");
                        return false;
                    }
                } else {
                    if (!(cards[i].cardValue + 1 == cards[i+setCount].cardValue)) {
                        // console.log("Not sequential sets");
                        return false;
                    }
                }
            } 
            else {
                // console.log("Failed first set card suit check");
                return false;
            }
        }

        // How many sets to check left in the play
        for (var j = 1; j <= (cards.length - setCount)/setCount; j++) {
            // Traverse through a set and check they are the same card
            for (var k = 0; k < setCount-1; k++) {
                var index = setCount * j + k;
                if (!(cards[index].suit == cards[index+1].suit && cards[index].cardValue == cards[index+1].cardValue)) {
                    // console.log("Failed set check");
                    return false;
                }
            }
        }
    } else {
        // console.log("Failed set count check and divisible play count check");
        return false;
    }

    // Is a tractor!
    tractorSetCount = setCount;
    return true;
}

function testHand() {
    players[0].hand.length = 0;
    drawHand();
    var deckCount = 4;

    var suit = ["spades", "diamonds", "clubs", "hearts"];
    var names = ["2", "3", "4", "5", "6", "7", "8", "9", "I0", "J", "Q", "K", "A"];
    var points = 0;

    for (var i = 0; i < deckCount; i++) {
        for (var s = 0; s < 4; s++) {
            for (var v = 0; v <= 12; v++) {
                if (v==5 || v==10 || v==13) {
                    points = (v==5) ? 5:10;
                }
                players[0].hand.push(new Card(suit[s], names[v], v+2, false, points));
                points = 0;
            }
        }
        players[0].hand.push(new Card("trump", "S", 17, true, 0));
        players[0].hand.push(new Card("trump", "B", 18, true, 0));
    }

    for (var i = 0; i < players[0].hand.length; i++) {
        if (players[0].hand[i].suit == trumpSuit) {
            players[0].hand[i].isTrump = true;
            if (players[0].hand[i].cardValue == trumpValue) {
                players[0].hand[i].cardValue = 16;
            }
        }
        if (players[0].hand[i].cardValue == trumpValue) {
            players[0].hand[i].cardValue = 15;
            players[0].hand[i].isTrump = true;
        }
    }
    players[0].hand.sort(cardSort);
    drawHand();
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

function sizeCanvas() {
    table.width = (window.innerWidth >= 720) ? window.innerWidth : 720;
    table.height = (window.innerHeight >= 720) ? window.innerHeight : 720;
}

function centerText() {
    return {textBaseline: "middle", textAlign: "center"};
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
