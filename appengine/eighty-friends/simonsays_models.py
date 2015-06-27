from google.appengine.ext import ndb

class Player(ndb.Model):
    name = ndb.StringProperty('name')
    channel_token = ndb.StringProperty('channel_token')

class Game(ndb.Model):
    name = ndb.StringProperty('name')
    started = ndb.BooleanProperty('started', default=False)
    leader = ndb.StringProperty('leader')
    sequence_length = ndb.IntegerProperty('sequence_length', default=3)
    players = ndb.KeyProperty(kind=Player, repeated=True)
