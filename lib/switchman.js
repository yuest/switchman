var urlUtils = require('url');

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
        var split = splitURL( k.replace(/\/\/+/g, '/'))
          , urlPattern
          , o
          ;
        if ( typeof obj[ k ] == 'function' ) {
            urlPattern = getUrlPattern(prefix + split.url);
            o = acc[ urlPattern ] = acc[ urlPattern ] || {};
            o[ split.method || prev_method || '*' ] = obj[ k ];
        }
        else {
            flattenKeys( obj[ k ], acc, prefix + split.url, split.method);
        }
    });
    return acc;
}

function splitURL(url) {
    var method
      , path
      , match = /^([A-Z]+)(?:\s+|$)/.exec(url)
      ;
    if (match) {
        method = match[1];
        path = /^[A-Z]+\s+(.*)$/.exec(url);
        url = path ? path[1]: '';
    }
    return {url: url, method: method};
}


var exports = module.exports = function( rules ){
    var compiled = flattenKeys( rules )
      , regCache = {}
      ;
    function dispatch(req, res, next){
        var validUrl = req.url.replace(/\/\/+/g, '/');
        if ( req.url != validUrl ) {
            res.writeHead(302, { 'Content-Type': 'text/html', 'Location': validUrl });
            res.end('Found: <a href="' + validUrl + '">' + validUrl + '</a>');
            return;
        }
        if (!Object.keys( compiled ).some( function( k ) {
            var urlObj = urlUtils.parse( req.url )
              , reg = regCache[ k ] || (regCache[ k ] = new RegExp( '^' + k + '$' ))
              , match = reg.exec( urlObj.pathname )
              , action = compiled[ k ][ req.method ] || compiled[ k ]['*']
              , urlRedirection;
            if ( !match || !action ) {
                return false;
            }
            if ( action == exports.removeSlash ) {
                urlRedirection = urlObj.pathname.replace(/\/$/, '') + (urlObj.search || '');
            }
            if ( action == exports.addSlash ) {
                urlRedirection = urlObj.pathname + '/' + (urlObj.search || '');
            }
            if ( urlRedirection ) {
                if ( req.method == 'GET' || req.method == 'HEAD' ) {
                    res.writeHead(302, { 'Content-Type': 'text/html', 'Location': urlRedirection });
                    res.end('Found: <a href="' + urlRedirection + '">' + urlRedirection + '</a>');
                    return true;
                } else {
                    return false;
                }
            }
            action.apply( null, [req, res, next].concat( match.slice(1)));
            return true;
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
exports.removeSlash = function ( req, res, next ) { next(); };
exports.addSlash = function ( req, res, next ) { next(); };
