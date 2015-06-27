#!/usr/bin/python
########################### HERP DERP

import random

def main():

    class Card: # makes Card objects. For deck generation.
        def __init__(self, value, suit, number, isTrump, color):
            self.value = value
            self.suit = suit
            self.number = number
            self.isTrump = isTrump
            self.color = color
        def setTrump(self):
            self.isTrump = True
        def setValue(self, value):
            self.value = value
        def __repr__(self):
            return "{} of {} {} {} {}".format(self.number,
                                                self.suit,
                                                self.color,
                                                self.isTrump,
                                                self.value)
        def __cmp__(self, other): 
            if self.isTrump and not other.isTrump:
                return 1
            elif other.isTrump and not self.isTrump:
                return -1
            elif self.isTrump and other.isTrump:
                if self.value == 15 and other.value == 15:
                    if self.suit>other.suit:
                        return 1
                    elif self.suit<other.suit:
                        return -1
                    else:
                        return self.value-other.value
                else: 
                    return self.value-other.value
            else:
                if self.suit>other.suit:
                    return 1
                elif self.suit<other.suit:
                    return -1
                else:
                    return self.value-other.value

    class Deck: # generates deck. This implementation requires a new deck to be generated per round
        def __init__(self):
            self.cards = []
            for i in [2,3,4,5,6,7,8,9,10,11,12,13,14]:
                for j in ["heart", "diamond", "spade", "club"]:
                    if j == "heart" or j=="diamond":
                        card = Card(i,j,i,False,"red")
                        self.cards.append(card)
                    else:
                        card = Card(i,j,i,False,"black")
                        self.cards.append(card)
            bigjoker = Card(18,"trump", 18, True,"red")
            smalljoker = Card(17,"trump", 17, True,"black")
            self.cards += [smalljoker,bigjoker]

            def __repr__(self):
                return "{}".format(self.cards)
 



### Code later: Player count determines number of decks. playernum/2 = decknum

    def deck_gen(players):
        n = players/2
        big_deck = []
        while n>0:
            big_deck += Deck().cards
            n = n-1
        return big_deck

    testdeck = deck_gen(3)
    print testdeck

    def setTrump(cards, suit, number):
        for i in range(len(cards)):

            # sets high trump number value to 16
            if cards[i].suit == suit and cards[i].number == number:
                cards[i].setTrump()

                # sets high trump value to 16, below the small joker (17)
                cards[i].setValue(16)

            # sets low trump number value to 15 (above Ace (14))
            elif cards[i].suit != suit and cards[i].number == number:
                cards[i].setTrump()
                cards[i].setValue(15)

            # sets non-trump number trumps to trump status True
            elif cards[i].suit == suit and cards[i].number != number:
                cards[i].setTrump()

            # Adds 1 to values of numbers below trump number so that they are consecutive with 
            # numbers above the trump value. eg: 4 is trump, this makes 3 and 5 consecutive by 
            # changing 3'ss value to 4. 2 is changed to 3 to make 2 consecutive with 3's new value.
                if cards[i].number < number:
                    cards[i].setValue(cards[i].value+1)
            
            # same as above but for non-trumps.
            else:
                if cards[i].number < number:
                    cards[i].setValue(cards[i].value+1)

    setTrump(testdeck, "hearts", 4)



### Sample hand generator function for 7 person game: 22 cards per player, 8 cards in the bottom
### Actual dealing function should deal one card at a time to each hand.

    # def dealhand(deck):
    #   hand = []
    #   for i in range(22):
    #       newcard = random.choice(deck)
    #       hand.append(newcard)
    #       deck.remove(newcard)
    #   return hand

    # hand1 = dealhand(testdeck3)
    # print len(testdeck3)
    # print "Hand: \n"


    # for i in hand1:
    #   print i.number, i.suit, i.value, i.isTrump



### Starting play class: StartingPlay
### Ask for player to choose cards, which will create StartingPlay object.
### startCheck will create/modify the attributes of the starting play StartingPlay object.
### If startCheck finds invalid move, will ask player again to choose cards, and will create a new object? Or just edit the old

    class StartingPlay:
        def __init__(self):
            self.cards = None
            self.play = None
            self.suit = None
            self.isTrump = None
            self.value = None # if tractor, set value to higher value in the tractor

        def __repr__(self):
            return "Play: {} \nType: {} \nSuit: {} \nisTrump: {} \nValue: {}".format(self.cards,
                                                                        self.play,
                                                                        self.suit,
                                                                        self.isTrump,
                                                                        self.value)
        def setCards(self, cards):
            self.cards = sorted(cards)
        def setPlay(self, play):
            self.play = play
        def setSuit(self, suit):
            self.suit = suit
        def setisTrump(self, isTrump):
            self.isTrump = isTrump
        def setValue(self,value):
            self.value = value


### Starting player picks any single, pair, triple, or tractor. 

### Starting play check for suits/trumps if they match within the move/play.
    
    def valueCheck(card1, card2):
        return [card1.value == card2.value, card1.value, card2.value]

    def suitCheck(card1, card2): 
        return [card1.suit == card2.suit, card1.suit, card2.suit]

    def trumpCheck(card1, card2):
        return [card1.isTrump, card2.isTrump]

### Tractor check. 

    def tractorCheck(cards, i): # cards must be sorted to work

        if len(cards)%(i+1) != 0:
            return [False, "not a tractor, not same sizes"]

        else: # size of pair/triple/etc divides evenly into the length of play

            if len(cards) == i+1: # end condition, final group of values, check values

                for j in range(len(cards)-1):
                    if cards[j] != cards[j+1]:
                        return [False, "final group not the same"]
                    # else: # debugging purposes, delete later
                    #     print cards[j] == cards[j+1]

                return [True, "is tractor"]

            else: # not the final group, compare with next group
                if trumpCheck(cards[i], cards[i+1]) == [True, False] or trumpCheck(cards[i], cards[i+1]) == [False, True]:
                    return [False, "trumps and nontrump"]
                elif trumpCheck(cards[i], cards[i+1]) == [False, False]: # non-trumps
                    if suitCheck(cards[i], cards[i+1])[0] == False:
                        return [False, "suits don't match"]
                    else: 
                        # check with next group for consecutive
                        if (cards[i].value + 1) != cards[i+1].value:
                            return [False, "not a tractor, nonconsecutive"] # could be LeadingMoveThing though

                        else: # are consecutive
                            # check next group for equality
                            nextgroup = cards[i+1:i+1+1+i] # next group of i+1 cards
                            for k in range(len(nextgroup)-1):
                                if nextgroup[k] != nextgroup[k+1]:
                                    return [False, "group not all same"]
                                # else: 
                                #     print nextgroup[k] == nextgroup[k+1]

                            return tractorCheck(nextgroup, i)

                elif trumpCheck(cards[i], cards[i+1]) == [True, True]: # trumps
                    # check with next group for consecutive
                    if (cards[i].value + 1) != cards[i+1].value:
                        return [False, "not a tractor, nonconsecutive"] # could be LeadingMoveThing though

                    else: # are consecutive
                        # check next group for equality
                        nextgroup = cards[i+1:i+1+1+i] # next group of i+1 cards
                        for k in range(len(nextgroup)-1):
                            if nextgroup[k] != nextgroup[k+1]:
                                return [False, "group not all same"]
                            # else: 
                            #     print nextgroup[k] == nextgroup[k+1]

                        return tractorCheck(nextgroup, i)


### USE THIS ONE
    def newStartCheck(cards):

        if len(cards)<1: # move has to be at least one card to be valid
            return [False, "less than one card", 0]
            # ask player to make a valid move

        elif len(cards)==1: # 1 card is always a valid starting move
            return [True, "single", 1, cards[0]]

        else: 
            for i in range(len(cards)-1): 
                if cards[i] != cards[i+1]:
                    return tractorCheck(cards, i) + [len(cards)] + [cards[len(cards)-1]]

            return [True, "multiple", len(cards), cards[0]]

### setPlay/start? Do this after a newStartCheck
    def setStartingPlay(cards, starting_play)):
        if newStartCheck(cards)[0] == False:
            return False # invalid move, make player re-choose
        else:
            starting_play = StartingPlay
            starting_play.setCards(cards)
    # continue later, need to reduce redundancy somewhere


### Non-starting player checks.
### move is player move, starting_move is the starting play which should be checked against - both are list of card objects
### hand is player's hand, to check against to force matching suit and force pairs/triples/play types. 
### isTractor = the kind of tractor, ie: pairs = 2, triples = 3, not a tractor = 0 
### (because tractorCheck takes arg 'i' - size of group in the tractor)

    def moveCheck(move, starting_move, isTractor, handcards):
        move.sort()
        hand = handcards
        for card in move: # removes all cards in move from hand for checking purposes //// wait this doesn't work shit, breaks pair/triple/etc check
            hand.remove(card)
        
        if len(move) != len(starting_move): # move needs to match number of cards in starting_move
            return False, "must play same number of cards"
        
        else:

            if isTractor == 0 :

                if len(move) == 1:
                    if starting_move[0].isTrump and starting_move[0].isTrump == move[0].isTrump: # both trumps
                        return move

                    elif (not starting_move[0].isTrump) and starting_move[0].isTrump == move[0].isTrump: # nontrumps
                        if starting_move[0].suit == move[0].suit: # same suit
                            return move
                        else: # different suits
                            if any(card.suit == starting_move[0].suit and card.isTrump == starting_move[0].isTrump for card in hand): #checks hand for starting suit
                            # is this syntax even right wat
                                return False, "must play same suit"
                            else:
                                return move
                    elif starting_move[0].isTrump and starting_move[0].isTrump != move[0].isTrump:
                        if any(card.isTrump == starting_move[0].isTrump for card in hand):
                            return False, "must play trump"
                        else:
                            return move

                    elif (not starting_move[0].isTrump) and starting_move[0].isTrump != move[0].isTrump:
                        if any(card.suit == starting_move[0].suit and card.isTrump == starting_move[0].isTrump for card in hand):
                            return False, "must play same suit"
                        else:
                            return move

                else: # pairs+
                    for i in range(len(move)-1):

                        if move[i] != move[i+1]:
                            if 

                            if starting_move[0].isTrump and starting_move[0].isTrump == move[i].isTrump: # both trumps
                                return move

                            elif (not starting_move[0].isTrump) and starting_move[0].isTrump == move[i].isTrump: # nontrumps
                                if starting_move[0].suit == move[i].suit: # same suit
                                    return move
                                else: # different suits
                                    if any(card.suit == starting_move[0].suit and card.isTrump == starting_move[0].isTrump for card in hand): #checks hand for starting suit
                                    # is this syntax even right wat
                                        return False, "must play same suit"
                                    else:
                                        return move
                            elif starting_move[0].isTrump and starting_move[0].isTrump != move[i].isTrump:
                                if any(card.isTrump == starting_move[0].isTrump for card in hand):
                                    return False, "must play trump"
                                else:
                                    return move

                            elif (not starting_move[0].isTrump) and starting_move[0].isTrump != move[i].isTrump:
                                if any(card.suit == starting_move[0].suit and card.isTrump == starting_move[0].isTrump for card in hand):
                                    return False, "must play same suit"
                                else:
                                    return move




    # test startCheck: suit/trump match check 
    # card1 = Card(3, "heart", 3, False, "red")
    # card2 = Card(4, "heart", 4, False, "red")
    # card3 = Card(15, "heart", 2, True, "red")
    # card4 = Card(16, "spade", 2, True, "black")
    # card5 = Card(3, "spade", 3, True, "black")
    # card6 = Card(3, "club", 3, False, "black")
    # card7 = Card(15, "club", 2, True, "black")
    # card8 = Card(18, "trump", 18, True, "red")
    # card9 = Card(18, "trump", 18, True, "red")

    # testhand = [card8, card1, card2, card3, card9, card4, card5, card6, card7]

    # print testhand
    # testhand.sort()
    # print testhand

    # StartingPlay class test

    # StartingPlaytest = StartingPlay(testhand)

    # for i in starttest.cards:
    #     print i

    # print "Test case 0: obviously invalid play"
    # print startCheck(testhand)
    # for i in testhand:
    #     print i.number, i.suit, i.isTrump
    # print "\n"

    # print "Test case 1: all nontrumps, same suit"
    # print startCheck([card1, card2])
    # for i in [card1, card2]:
    #     print i.number, i.suit, i.isTrump
    # print "\n"

    # print "Test case 2: all trumps, same suit"
    # print startCheck([card5, card4])
    # for i in [card5, card4]:
    #     print i.number, i.suit, i.isTrump
    # print "\n"
    
    # print "Test case 3: all nontrumps, different suit"
    # print startCheck([card1, card6])
    # for i in [card1, card6]:
    #     print i.number, i.suit, i.isTrump 
    # print "\n"

    # print "Test case 4: all trumps, different suit"
    # print startCheck([card3, card4])
    # for i in [card3, card4]:
    #     print i.number, i.suit, i.isTrump
    # print "\n"

    # print "Test case 5: trump and nontrump, same suit"
    # print startCheck([card2, card3])
    # for i in [card2, card3]:
    #     print i.number, i.suit, i.isTrump
    # print "\n"

    # print "Test case 6: trump and nontrump, different suit"
    # print startCheck([card2, card4])
    # for i in [card2, card4]:
    #     print i.number, i.suit, i.isTrump
    # print "\n"

    # print "Test case 7: trump numbers of same value, different suit"
    # print startCheck([card7, card3])
    # for i in [card7, card3]:
    #     print i.number, i.suit, i.isTrump
    # print "\n"

    # Tractor test

    # Tractor1 = Card(15, "hearts", 2, True, "red")
    # Tractor2 = Card(15, "hearts", 2, True, "red")
    # Tractor3 = Card(16, "spades", 2, True, "black")
    # Tractor4 = Card(16, "spades", 2, True, "black")
    # Tractor5 = Card(15, "diamonds", 2, True, "red")
    # Tractor6 = Card(15, "diamonds", 2, True, "red")
    # Tractor7 = Card(17, "trump", 17, True, "black")
    # Tractor8 = Card(17, "trump", 17, True, "black")
    # Tractor9 = Card(14, "spades", 14, True, "black")
    # Tractor10 = Card(14, "spades", 14, True, "black")
    # Tractor11 = Card(14, "hearts", 14, False, "red")
    # Tractor12 = Card(14, "hearts", 14, False, "red")
    # Tractor13 = Card(13, "hearts", 13, False, "red")
    # Tractor14 = Card(13, "hearts", 13, False, "red")
    # Tractor15 = Card(13, "diamonds", 13, False, "red")
    # Tractor16 = Card(13, "diamonds", 13, False, "red")
    # Tractor17 = Card(12, "hearts", 12, False, "red")
    # Tractor18 = Card(12, "hearts", 12, False, "red")
    # Tractor19 = Card(13, "spades", 13, True, "black")
    # Tractor20 = Card(13, "spades", 13, True, "black")

    # print "tractor test 1: trumps, different suits, small trump number and big trump number"
    # tractorstarttest = StartingPlay([Tractor1, Tractor2, Tractor3, Tractor4])
    # print [Tractor1, Tractor2, Tractor3, Tractor4]
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test 2: trumps, different suit, trump ace and small trump number"
    # tractorstarttest = StartingPlay([Tractor9, Tractor10, Tractor1, Tractor2])
    # print [Tractor9, Tractor10, Tractor1, Tractor2]
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test 3: trumps, different suits, big trump number, smaller joker"
    # tractorstarttest = StartingPlay([Tractor3, Tractor4, Tractor7, Tractor8])
    # print [Tractor3, Tractor4, Tractor7, Tractor8]
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test 4: trumps and nontrumps, same suits, heart ace nontrump, heart two trump"
    # tractorstarttest = StartingPlay([Tractor11, Tractor12, Tractor1, Tractor2])
    # print [Tractor11, Tractor12, Tractor1, Tractor2]
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test 5: nontrumps, same suits, heart ace nontrump, heart K trump"
    # tractorstarttest = StartingPlay([Tractor13, Tractor14, Tractor11, Tractor12])
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test6: nontrumps, different suits, heart ace nontrump, diamond K trump"
    # tractorstarttest = StartingPlay([Tractor15, Tractor16, Tractor11, Tractor12])
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test7: nontrumps, same suit, heart ace nontrump, heart queen nontrump"
    # tractorstarttest = StartingPlay([Tractor17, Tractor18, Tractor11, Tractor12])
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test 8: trumps, same suits, ace trumps, king trumps"
    # tractorstarttest = StartingPlay([Tractor19, Tractor20, Tractor9, Tractor10])
    # print startCheck(tractorstarttest.cards), "\n"
    # print newStartCheck(tractorstarttest.cards), "\n"

    # print "tractor test 9: second pair is not a pair"
    # tractorstarttest = StartingPlay([Tractor19, Tractor20, Tractor9, Tractor6])
    # print startCheck(tractorstarttest.cards), "\n"



main()
