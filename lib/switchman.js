var url = require('url');

function extend ( a, b ){
    Object.keys( b ).forEach( function ( k ) {
        a[ k ] = b[ k ];
    });
    return a;
};

function getUrlPattern( url ) {
    return url.replace(/\/:\w+/g, '(?:/([^\/]+))');
}

function flattenKeys(obj, /*optional args: */acc, prefix, prev_method){
    acc = acc || {};
    prefix = prefix || '';
    Object.keys( obj || {}).forEach( function ( k ) {
        if ( !k ) {
            return;
        }
        var split = splitURL( k );
        if ( typeof obj[ k ] == 'function' ) {
            urlPattern = getUrlPattern(prefix + split.url)
            var o = acc[ urlPattern ] = acc[ urlPattern ] || {};
            o[ split.method || prev_method || '*' ] = obj[ k ];
        }
        else {
            flattenKeys( obj[k], acc, prefix + split.url, split.method);
        }
    });
    return acc;
}

function splitURL(url) {
    var method, path, match = /^([A-Z]+)(?:\s+|$)/.exec(url);
    if (match) {
        method = match[1];
        path = /^[A-Z]+\s+(.*)$/.exec(url);
        url = path ? path[1]: '';
    }
    return {url: url, method: method};
}


module.exports = function( rules ){
    var compiled = flattenKeys( rules );
    function dispatch(req, res, next){
        if (!Object.keys( compiled ).some( function( k ) {
            var match = (new RegExp( '^' + k + '$' )).exec( url.parse( req.url ).pathname );
            if ( match ) {
                if ( req.method in compiled[ k ]) {
                    compiled[ k ][ req.method ].apply( null, [req, res, next].concat( match.slice(1)));
                    return true;
                } else if ( '*' in compiled[ k ]) {
                    compiled[ k ]['*'].apply( null, [req, res, next].concat( match.slice(1)));
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        })) next();
    }

    dispatch.add = dispatch.update = dispatch.insert = dispatch.upsert = function ( rules ) {
        extend( compiled, flattenKeys( rules ));
    }
    /*
    * @param: rule ('GET /some/path')
    * @param: url, method ('/some/path', 'GET')
    */
    dispatch.remove = function ( url, method ) {
        var split ,urlPattern;
        if ( !method ) {
            split = splitURL( url );
            url = split.url;
            method = split.method;
        }
        urlPattern = getUrlPattern( url );
        if ( urlPattern in compiled ) {
            if ( !method ) {
                delete compiled[ urlPattern ];
            } else if ( method in compiled[ urlPattern ]) {
                delete compiled[ urlPattern ][ method ];
            }
        }
    }
    return dispatch;
};
