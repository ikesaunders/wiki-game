var secureRandom = require('secure-random');
var fetch = require('node-fetch');

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'yaroncnk',
        password: '',
        database: 'wikisprint'
    }
});

var api = {

    createUsername: function() {
        var a = ["Dark", "Funny", "Boring", "Small", "Blue", "Ugly", "Big", "Lazy", "Cool", "Smart", "Grey", "Red", "Bright", "Naive", "Royal", "Impatient"];
        var b = ["Melon", "Apple", "Kiwi", "Lizard", "Bear", "Dog", "Banana", "Dragon", "Cat", "Bird", "Snake", "Moose", "Skunk", "Racoon", "Tiger"];

        var rA = Math.floor(Math.random() * a.length);
        var rB = Math.floor(Math.random() * b.length);
        var name = a[rA] + " " + b[rB];
        return name;
    },
    createSlug: function() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
    },
    createSessionToken: function() {
        return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
    },
    //show who the players are
    findPlayers: function() {
        knex.select().from('player')
            .then(results => {
                console.log(results);
            })
            .catch(error => {
                console.log(error);
            });
    },
    //show what games are played
    findGames: function() {
        knex.select().from('game')
            .then(results => {
                console.log(results);
            })
            .catch(error => {
                console.log(error);
            });
    },
    createUser: function() {
        var token = this.createSessionToken();
        var username = this.createUsername();
        knex('player').insert({
            sessionId: token,
            username: username
        })
        .then(result => {
            return "User created";
        });
        return token;
    },
    findPlayerFromSessionId: function(sessionId) {
        return( knex.select('player.id', 'player.username')
            .from('player')
            .where('player.sessionId', sessionId))
            .then(results => {
                return results[0];
            })
            .catch(error => {
                return ('something went wrong:', error);
            });
    },
    // /game/create creating a new game
    createGame: function(playerId) {
        var gameSlug = this.createSlug();
        return knex('game').insert({
            slug: gameSlug,
            adminId: playerId,
            isPublic: 0,
            gameStarted: null,
            startingURL: 'https://en.wikipedia.org/wiki/IserveU',
            endURL: 'https://en.wikipedia.org/wiki/Germany',
            finalStep: null,
            createdAt: knex.fn.now()
        })
        .then(gameId => {
            console.log("gameId is ", gameId);
            return knex.select('game.id', 'game.adminId', 'game.slug', 'game.isPublic', 'game.gameStarted', 'game.startingURL', 'game.endURL', 'game.finalStep')
                .from('game')
                .where('game.id', gameId);
        })
        .then(gameArray => {
            return gameArray[0];
        });
    },
    // /game/:slug/make-public   making a game public
    makePublic: function(id) {

        knex('game').where({
            id: id
        }).insert({
            isPublic: 1
        });
    },
    // /lobbies checking public lobbies
    lobbies: function() {
        knex('game').where({
                isPublic: 1
            }).select('id', 'adminId')
            .then(results => {
                return results;
            })
            .catch(error => {
                return error;
            });
    },
    getArticle: function (title) {
    return fetch(`https://en.wikipedia.org/wiki/${title}?action=render`)
        .then(response => {
            return response.text();
        });
    }
};

module.exports = api;