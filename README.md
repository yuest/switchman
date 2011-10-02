这是一个 [Connect](http://senchalabs.github.com/connect/) 的 url router middleware，是 [caolan](https://github.com/caolan/) 的 [dispatch](https://github.com/caolan/dispatch/) 的一个重写，因此在 API 设计上沿用自 dispatch。为了让它成为一个更合我意的 url router，我加入了返回对象，可以通过 add 和 remove 方法在之后添加或移除 url 规则。比如

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
