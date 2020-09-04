// @ts-check
const http = require("http");
const etag = require('etag');

/** @param {number} n */
const wait = (n) => new Promise((r) => setTimeout(r, n));

const server = http.createServer();

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').OutgoingMessage} res
 */
const onRequest = async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  if (req.url !== '/') return res.end('');

  // Initial <head> element that contains a script
  const head = `
    <!doctype html>
    <html>
    <head>
    <title>Hello</title>
    <script
      src="https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js">
    </script>`;

  // Note that <head> is kept open in case we want to add even more elements to it
  const body = `
      </head>
      <body>
      <h1>Hello World!</h1>
      </body>
      </html>`;

  // Set initial headers
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Transfer-Encoding", "chunked");

  // Announce what headers will be sent as trailer.
  res.setHeader("Trailer", "ETag");

  // Send the <head> so browser can start downloading jQuery 
  res.write(head);

  // Simulate slow body computation
  await wait(500);

  // Now that the entire body is available, compute the body dependent headers 
  // and send them as Trailers
  res.addTrailers({'ETag': etag(head + body)})

  // Finish the response with body. 
  res.end(body);
};

server.on("request", onRequest);
server.listen(3300);
