var connect = require('connect')
    ,switchman = require('./lib/switchman')
    ,urlRules = switchman()
    ;

connect( urlRules ).listen(8080);

urlRules.add({
    '/': function ( req, res, next ) {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Hello, World!');
    }
});
urlRules.add({
    '/hello/:name': function ( req, res, next, name ) {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('Hello, ' + name +'!');
    }
});
urlRules.remove('/hello/:name');
