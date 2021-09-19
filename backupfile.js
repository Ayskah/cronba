const path = require('path');
const fs = require('fs');

/**
 * A backup process generated file
 * @class BackupFile
 */
class BackupFile {
  /**
   * Creates an instance of BackupFile.
   * @param {String} name Name of a raw file
   * @param {String} from Directory of a raw file
   * @param {String} to Directory to backup a raw file to
   * @returns {BackupFile} Current instance
   * @memberOf BackupFile
   */
  constructor(name, from, to) {
    // File's name
    this.fullSourceName = path.basename(name);
    this.sourceName = path.basename(name, path.extname(name));
    this.extension = path.extname(name);

    if (!this.sourceName || this.sourceName.length === 0) throw Error('No name parsed');
    if (!this.extension || this.extension.length === 0) throw Error('No extension parsed');

    // File's path
    this.sourcePath = from;
    this.fullSourcePath = path.resolve(from, path.basename(name));
    this.fullDestinationPath = path.resolve(to, path.basename(name));

    this.size = fs.statSync(this.fullSourcePath).size;
    return this;
  }

  /**
   * Add a backup generated file to a tar entry
   * @param {any} tarFile A tar file to pack the files within
   * @returns {Object} A tar file entry
   * @memberOf BackupFile
   */
  pack(tarFile) {
    const filePath = this.fullDestinationPath;
    const fileBuffer = fs.readFileSync(
      path.resolve(filePath),
    );
    return tarFile.entry(
      { name: this.fullDestinationPath },
      fileBuffer,
    );
  }
}

module.exports = BackupFile;
