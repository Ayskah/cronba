/* eslint-disable no-console */
const chalk = require('chalk');

// if (process.env.NODE_ENV === 'test') console.log = () => {};

const summary = (text, details) => {
  console.log(text.concat(' ', details ? chalk.yellow(details) : ''));
};
const title = (text, details) => {
  console.log('\n--------------');
  console.log(text.concat(' ', details ? chalk.green(details) : ''));
  console.log('--------------');
};
const log = (text, details) => console.log(text.concat(' ', chalk.cyan(details)));
const warn = (text, details) => console.log(text.concat(' ', chalk.yellow(details)));
const error = (e) => {
  console.log('\n--------------');
  console.log(`${chalk.red(e.stack)}`);
  console.log('--------------');
};
const success = (text, details) => {
  console.log(chalk.green('--------------'));
  console.log(chalk.green(text.concat(' ', details)));
  console.log(chalk.green('--------------'));
};
const progress = (text, details) => console.log(text.concat(' ', chalk.green(details)));

module.exports = {
  title, log, warn, error, success, progress, summary,
};
