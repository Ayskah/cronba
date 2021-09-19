const fs = require('fs');

class Folders {
  /**
   * Scan files within a directory
   * @static
   * @param {String} from Directory to scan the files from
   * @returns {Array<fs.Dirent} Files of the folder
   * @memberOf Folders
   */
  static scanFiles(from, pattern) {
    const scannedFiles = fs.readdirSync(from, {
      withFileTypes: true
    })
    return this.scanMatchingFiles(scannedFiles, pattern);
  }
  /**
   * Scan files which name's match a given pattern
   * @static
   * @param {String} from Directory to scan the files from
   * @returns {Array<fs.Dirent} Files of the folder
   * @memberOf Folders
   */
  static scanMatchingFiles(files, pattern) {
    return files.filter(
      (file) => file.isFile() && new RegExp(pattern).test(file.name)
    );
  }
  /**
   * Get stats from a folder
   * @static
   * @param {String} from Directory to get the stats from
   * @returns {fs.Stats} stats of the folder
   * @memberOf Folders
   */
  static getStats(from) {
    if (!fs.existsSync(from)) throw new Error('Directory does not exist');
    return fs.statSync(from, async (e, stats) => {
      if (e) throw e;
      return stats;
    });
  }
}

module.exports = Folders;
