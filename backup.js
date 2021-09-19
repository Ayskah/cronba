const path = require('path');
const folders = require('./folders');
const logger = require('./logger');
const fileSystem = require('./filesystem');
const BackupFile = require('./backupfile');
const fs = require("fs");
/**
 * A backup process
 * @class Backup
 */
class Backup {
  /**
   * Creates an instance of Backup.
   * @param {String} from Directory containing the files
   * @param {String} to Directory to backup the files to
   * @param {String} pattern Pattern to match filenames
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  constructor(from, to, pattern) {
    // Args
    if (!from || from.length === 0) throw Error('No source directory');
    else if (!to || to.length === 0) throw Error('No destination directory');
    else if (!pattern || pattern.length === 0) throw Error('No file pattern');

    // FS
    if (!fs.existsSync(from)) throw new Error('Source directory does not exist');
    else if (!fs.existsSync(to)) throw new Error('Destination directory does not exist');

    // Backp process
    this.from = path.resolve(from);
    this.to = path.resolve(to);
    this.pattern = pattern;
    this.scannedFiles = [];
    this.parsedFiles = [];
    this.copiedFiles = [];

    // Archive
    this.name = path.join(this.to, `/Arch${new Date().getTime()}.tar`);

    return this.summary();
  }

  /**
   * Scan files to backup
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  scanFiles() {
    logger.title('Scanning', `${this.from}`);
    this.scannedFiles = folders.scanFiles(this.from, this.pattern);
    if (!this.scannedFiles || this.scannedFiles.length === 0) throw Error('No scannedFiles');
    logger.success('=> Scanned', `${this.scannedFiles.length} files`);
    return this;
  }

  /**
   * Prepare files to backup
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  prepareFiles() {
    this.parsedFiles = this.scannedFiles.map((rawFile, index) => {
      const parsedFile = new BackupFile(rawFile.name, this.from, this.to);
      logger.log(
        `\t[${index + 1}/${this.scannedFiles.length}] Scanned`,
        `"${parsedFile.fullSourcePath}"`,
      );
      return parsedFile;
    });
    if (!this.parsedFiles || this.parsedFiles.length === 0) throw Error('No parsedFiles');
  }

  /**
   * Copy prepared files to backup
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  copyFiles() {
    logger.title('Copying', `${this.parsedFiles.length} files`);
    this.copiedFiles = fileSystem.copy(this.parsedFiles);
    if (!this.copiedFiles || this.copiedFiles.length === 0) throw Error('No copiedFiles');
    logger.success('=> Copied', `${this.parsedFiles.length} files`);
    return this;
  }

  /**
   * Archive copied files
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  async archiveFiles() {
    logger.title('Packing', `${this.copiedFiles.length} files`);
    this.tarPack = fileSystem.pack(this.copiedFiles);
    logger.success('=> Packed', `${this.copiedFiles.length} files`);

    logger.title('Archiving', `${this.copiedFiles.length} files`);
    this.tarFile = await fileSystem.archive(this.name, this.tarPack);
    if (!this.tarFile || !this.tarFile.size) throw Error('No tarFile');
    logger.success('=> Archived', `${this.copiedFiles.length} files (${this.tarFile.size})`);
    return this;
  }

  /**
   * Clean archived copied files
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  cleanFiles() {
    logger.title('Cleaning', `${this.copiedFiles.length} files`);
    fileSystem.clean(this.copiedFiles);
    logger.success('=> Cleaned', `${this.copiedFiles.length} files`);
    return this;
  }

  /**
   * Print a summary of this instance
   * @returns {Backup} Current instance
   * @memberOf Backup
   */
  summary() {
    logger.title('Summary');
    logger.log('\t[F]:', `"${this.from}"`);
    logger.log('\t[T]:', `"${this.to}"`);
    logger.log('\t[P]:', `"${this.pattern}"`);
    return this;
  }
}

module.exports = Backup;
