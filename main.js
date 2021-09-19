const { argv } = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $npm run cronba -- [options]')
  .example('----------------------------------------')
  .example('Backup every files from "from" to "to"')
  .example('=> npm run cronba -- -f=/from -t=/to')
  .example('----------------------------------------')
  .example('Backup every .jpg files from "from" to "to"')
  .example('=> npm run cronba -- -f=/from -t=/to -p=jpg')
  .example('----------------------------------------')
  .alias('f', 'from')
  .nargs('f', 1)
  .describe('f', 'Source directory')
  .alias('t', 'to')
  .nargs('t', 1)
  .describe('t', 'Target directory')
  .alias('p', 'pattern')
  .nargs('p', 1)
  .describe('p', 'File pattern')
  .demandOption(['f', 't', 'p'])
  .help(false)
  .version(false);

const { exit } = require('yargs');
const Driver = require('./backup');
const { error } = require('./logger');

(async () => {
  let driver;
  try {
    driver = new Driver(argv.from, argv.to, argv.pattern);
    driver.scanFiles();
    driver.prepareFiles();
    driver.copyFiles();
    await driver.archiveFiles();
    driver.cleanFiles();
  } catch (e) {
    error(e);
    exit(-1);
  }
})();
