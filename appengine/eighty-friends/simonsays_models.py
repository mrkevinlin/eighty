from google.appengine.ext import ndb

class Player(ndb.Model):
    name = ndb.StringProperty('name')
    channel_token = ndb.StringProperty('channel_token')
    played_this_round = ndb.BooleanProperty(default=False)

class Game(ndb.Model):
    name = ndb.StringProperty('name', required=True)
    started = ndb.BooleanProperty('started', default=False)
    # TODO: consider making this a keyproperty instead of String
    leader = ndb.StringProperty('leader')
    sequence_length = ndb.IntegerProperty('sequence_length', default=3)
    players = ndb.KeyProperty(kind=Player, repeated=True)
    sequence = ndb.IntegerProperty(repeated=True)
    players_played = ndb.IntegerProperty(default=0)
