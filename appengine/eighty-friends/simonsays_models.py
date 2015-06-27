from google.appengine.ext import ndb

class Player(ndb.Model):
    name = ndb.StringProperty('name')
    channel_token = ndb.StringProperty('channel_token')

    @classmethod
    def get_player_names(cls):
        return [x.name for x in cls.query()]

class Game(ndb.Model):
    name = ndb.StringProperty('name')
    started = ndb.BooleanProperty('started', default=False)
    leader = ndb.StringProperty('leader')
    sequence_length = ndb.IntegerProperty('sequence_length', default=3)
    players = ndb.KeyProperty(kind=Player, repeated=True)

    @classmethod
    def get_default(cls):
        return cls.query(cls.name == 'default')
