
module.exports = {
    express : require('express'),
    parser : require('body-parser').json({limit: '1024mb'}),
    mocha : require('mocha'),
    morgan : require('morgan'),
    cors : require('cors'),
    shortId : require('short-id'),
    jwt : require('jsonwebtoken'),
    bcrypt: require('bcryptjs'),
    io: require('socket.io')
}
