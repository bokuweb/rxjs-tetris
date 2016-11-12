var connect = require('connect'),
    serveStatic = require('serve-static');

var app = connect();

console.log(__dirname + '/docs/')
app.use(serveStatic(__dirname + '/docs'));
app.listen(3334);
