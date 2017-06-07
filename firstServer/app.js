const http = require('http');
const PORT = 8080;

function requestHandler (request, response) {
  if(request.url == '/') {
    response.end("Welcome!");
  }
  if(request.url == '/urls') {
    response.end("www.lighthouselabs.com");
  }
  else {
    response.statusCode = 400;
    response.end("Unknown Path!");
  }
}

var server = http.createServer(requestHandler);

server.listen(PORT, function(){
  console.log(`Server listening on http://localhost:${PORT}`)
});