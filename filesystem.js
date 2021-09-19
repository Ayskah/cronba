const tar = require('tar-stream');
const fs = require('fs');
const logger = require('./logger');
const {
  bytesToSize,
} = require('./helpers');
const { getStats } = require('./folders');

class FileSystem {
  /**
   * Copy files toward their backup's folder
   * @static
   * @param {Array<BackupFile>} files Copy files to the backup's directory
   * @returns {Array<BackupFile>} Files copied
   * @memberOf FileSystem
   */
  static copy(files) {
    const copiedFiles = files.map((file, index) => {
      const sourcePath = file.fullSourcePath;
      const destPath = file.fullDestinationPath;
      logger.log(`\t[${index + 1}/${files.length}] Copying`, `"${sourcePath}"`);
      fs.copyFileSync(sourcePath, destPath);
      logger.progress(`\t[${index + 1}/${files.length}] Copied:`, `=> "${destPath}"`);
      return file;
    });
    return copiedFiles;
  }

  /**
   * Pack backup folder's copied files
   * @static
   * @param {Array<BackupFile>} files File to be packed
   * @returns {Object} A tar file
   * @memberOf FileSystem
   */
  static pack(files) {
    const tarFile = tar.pack();
    files.map(async (file, index) => {
      file.pack(tarFile);
      logger.log(
        `\t[${index + 1}/${files.length}] Packed`,
        `"${file.fullSourcePath}"`,
      );
    });
    tarFile.finalize();
    return tarFile;
  }

  /**
   * Finalize a tar pack
   * @static
   * @param {String} name Name of the tar file
   * @returns {Object<tar, size>} An object containing a tar file + it's size
   * @memberOf FileSystem
   */
  static async archive(name, tarPack) {
    const backupStream = fs.createWriteStream(name);
    await new Promise((resolve) => tarPack.pipe(backupStream)
      .on('close', () => resolve())
      .on('error', (error) => { throw error; }));
    const archiveStat = getStats(name);
    return {
      tarFile: tarPack,
      size: bytesToSize(archiveStat.size),
    };
  }

  /**
   * Clean copied files
   * @static
   * @param {Array<BackupFile>} files Files to be cleaned
   * @returns {Promise} File is deleted
   * @memberOf FileSystem
   */
  static clean(files) {
    files.map((file, index) => {
      const backupFilePath = file.fullDestinationPath;
      logger.log(
        `\t[${index + 1}/${files.length}] Cleaning`,
        `"${backupFilePath}"`,
      );
      return fs.unlinkSync(backupFilePath);
    });
  }
}

module.exports = FileSystem;
