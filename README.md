这是 connect 的 url router middleware，是 caolan 的 dispatch 的一个重写。让它成为一个更合我意的 url router。所以我对它加入了返回对象，可以通过 add 和 remove 方法在之后添加或移除 url 规则。比如

    var urlRules = switchman();
    connect( urlRules ).listen(80);
    urlRules.add({
        '/hello/': function ( req, res, next ) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, World!');
        }
      , '/hello/:name': function ( req, res, next, name ) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, '+name+'!');
        }
    });

以及 switchman.addSlash 和 switchman.removeSlash 方法，如：

    urlRules.add({
        '/hello': switchman.addSlash
      , '/hello/:name/': switchman.removeSlash
    });

这样，当访问 /hello 或 /hello/yuest/ 时，就会跳转到相应的 url。
