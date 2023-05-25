const fs = require('fs');
const http = require('http');

const siteDir = 'dashboard';
const dataDir = 'data';

const mimeTypes = {
  html: 'text/html',
  css: 'text/css',
  csv: 'text/csv',
  js: 'text/javascript',
};

class Content {
  fileSuffix(file) {
    file = file || this.file;
    return file && file.substring(file.lastIndexOf('.') + 1);
  }
  mapSuffixToMimeType(suffix) {
    suffix = suffix || this.fileSuffix();
    return this.mimeTypes[suffix] || `text/${suffix}`;
  }
  constructor(file, type) {
    this.file = file;
    this.mimeTypes = mimeTypes;
    this.data = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'});
    this.type = type ? type : this.mapSuffixToMimeType();
  }
}

const dashboardHTML = new Content(`${siteDir}/dashboard.html`);
const homePage = dashboardHTML;
const styleCSS = new Content(`${siteDir}/style.css`);

const jsContent = {
  '/script.js': new Content(`${siteDir}/script.js`),
  '/constants.js': new Content(`${siteDir}/constants.js`),
};

const macDir = `${dataDir}/bigmac`;
const cpiDir = `${dataDir}/rateinf`;
const wbDir  = `${dataDir}/world_bank`;

const csvContent = {
  '/data/WB-DATA.csv': new Content(`${wbDir}/WB-DATA.csv`),
  '/data/WB-METADATA.csv': new Content(`${wbDir}/WB-METADATA.csv`),
  '/data/big-mac-adjusted-index.csv':
      new Content(`${macDir}/adjusted-index.csv`),
  '/data/CPI_ARG.csv': new Content(`${cpiDir}/CPI_ARG.csv`),
  '/data/CPI_AUS.csv': new Content(`${cpiDir}/CPI_AUS.csv`),
  '/data/CPI_CAN.csv': new Content(`${cpiDir}/CPI_CAN.csv`),
  '/data/CPI_CHE.csv': new Content(`${cpiDir}/CPI_CHE.csv`),
  '/data/CPI_EUR.csv': new Content(`${cpiDir}/CPI_EUR.csv`),
  '/data/CPI_GBR.csv': new Content(`${cpiDir}/CPI_GBR.csv`),
  '/data/CPI_JPN.csv': new Content(`${cpiDir}/CPI_JPN.csv`),
  '/data/CPI_NZL.csv': new Content(`${cpiDir}/CPI_NZL.csv`),
  '/data/CPI_RUS.csv': new Content(`${cpiDir}/CPI_RUS.csv`),
  '/data/CPI_USA.csv': new Content(`${cpiDir}/CPI_USA.csv`),
};

const queryResponses = {
  '/': homePage,
  '/dashboard': dashboardHTML,
  '/style.css': styleCSS,
  ...jsContent,
  ...csvContent,
};

const hostname = 'localhost';
const httpPort = 3000;

const server = http.createServer((req, res) => {
  const query = req.url.split('?');
  const msg = query[1] &&
        query[1].decodeURIComponent(query[1].replace(/\+/g, ' '));
  const content = queryResponses[query[0]];
  if (content) {
    res.statusCode = 200;
    res.setHeader('Content-Type', content.type);
    res.end(content.data);
  } else {
    console.log('404:', query);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('404: not found');
  }
});

server.listen(httpPort, hostname, () => {
  console.log(`Server running at http://${hostname}:${httpPort}/`);
});
