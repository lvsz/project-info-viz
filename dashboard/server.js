const fs = require('fs');
const http = require('http');

class Content {
  #mimeTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'csv': 'text/csv',
    'js': 'text/javascript',
  };
  #getType(file) {
    const suffix = file.substr(file.lastIndexOf('.') + 1);
    const type = this.#mimeTypes.suffix;
    return type ? type : `text/${suffix}`;
  }
  constructor(file, type) {
    this.file = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'});
    this.type = type ? type : this.#getType(file);
  }
}
const dashboardHTML = new Content('./dashboard.html');
const scriptJS = new Content('./script.js');
const styleCSS = new Content('./style.css');
const dataDir = '../data/';
const macRawCSV = new Content(dataDir + 'bigmac/raw-index.csv');
const macAdjCSV = new Content(dataDir + 'bigmac/adjusted-index.csv');

const hostname = 'localhost';
const httpPort = 3000;

const server = http.createServer((req, res) => {
  const query = req.url.split('?');
  const msg =
      query[1] ? decodeURIComponent(query[1].replace(/\+/g, ' ')) : null;
  const ret200 = (content) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', content.type);
    res.end(content.file)
  };
  switch (query[0]) {
    case '/':
      ret200(dashboardHTML);
      break;
    case '/style.css':
      ret200(styleCSS);
      break;
    case '/script.js':
      ret200(scriptJS);
      break;
    case '/mac-raw.csv':
      ret200(macRawCSV);
      break;
    case '/mac-adj.csv':
      ret200(macAdjCSV);
      break;
    default:
      console.log('404:', query);
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404: not found');
  }
});

server.listen(httpPort, hostname, () => {
  console.log(`Server running at http://${hostname}:${httpPort}/`);
});
