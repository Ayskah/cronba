const mockfs = require('mock-fs');
const fs = require('fs');
const Backup = require('./backup');
const filesystem = require('./filesystem');
const { matchingFiles, nonMatchingFiles, backupFiles, baseStructure } = require('./fsMocks');
const path = require('path');

jest.mock('./logger');
describe('Backup', () => {
  const mockFrom = path.resolve('./mockFrom');
  const mockTo = path.resolve('./mockTo');
  const mockPat = 'matchingPattern';
  let backup;
  jest.spyOn(fs, "existsSync")
  jest.spyOn(fs, "readdirSync")
  beforeEach(() => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('9999-01-01').getTime());
  });

  describe('Backup driver', () => {
    test('it should create a backup object', () => {
      mockfs(baseStructure);
      expect(new Backup(mockFrom, mockTo, mockPat)).toEqual({
        from: './mockFrom',
        from: './mockTo',
        pattern: 'matchingPattern',
        scannedFiles: [],
        parsedFiles: [],
        copiedFiles: [],
        name: './mockTo/Arch253370764800000.tar',
      });
    });
    test('it should not create a backup object, source directory missing', () => {
      expect(() => new Backup(null, mockTo, mockPat)).toThrow('No source directory');
    }); 
    test('it should not create a backup object, destination directory missing', () => {
      expect(() => new Backup(mockFrom, null, mockPat)).toThrow(new Error('No destination directory'));
    });
    test('it should not create a backup object, file pattern missing', () => {
      expect(() => new Backup(mockFrom, mockTo, null)).toThrow(new Error('No file pattern'));
    });
  });
  describe('Scanning', () => {
    afterEach(() => {
      mockfs.restore();
    })
    describe('Non-existing directory', () => {
      beforeEach(() => {
        mockfs({});
      });
      test('it should throw if trying to scan a non-existing directory', () => {
        expect(() => new Backup(mockFrom, mockTo, mockPat)).toThrow(new Error('Source directory does not exist'));
      });
    });
    describe('Existing directory', () => {
      beforeEach(() => {
        mockfs(baseStructure);
        backup = new Backup(mockFrom, mockTo, mockPat)
      });
      describe('Empty directory', () => {
        test('it should throw if trying to scan an empty directory', () => {
          expect(() => backup.scanFiles()).toThrow(new Error('No scannedFiles'));
          expect(fs.existsSync).toHaveBeenCalledWith(backup.from);
          expect(fs.readdirSync).toHaveBeenCalledWith(backup.from, { withFileTypes: true });

        });
      });
      describe('Filled directory', () => {
        test('it should scan some non-matching files from a filled directory', () => {
          mockfs(nonMatchingFiles);
          backup = new Backup(mockFrom, mockTo, mockPat);
          expect(() => backup.scanFiles()).toThrow(new Error('No scannedFiles'));
          expect(fs.existsSync).toHaveBeenCalled();
          expect(fs.readdirSync.mock.results[0].value.length).toEqual(3);
          expect(backup.scannedFiles.length).toEqual(0);
        });
        test('it should scan some matching files from a filled directory', () => {
          mockfs(matchingFiles);
          backup = new Backup(mockFrom, mockTo, mockPat);
          backup.scanFiles();
          expect(fs.existsSync).toHaveBeenCalled();
          expect(fs.readdirSync.mock.results[0].value.length).toEqual(3);
          expect(backup.scannedFiles.length).toEqual(3);
        });
        test('it should scan some matching files from a filled directory, excluding sub-dirs', () => {
          mockfs({mockFrom: {...matchingFiles.mockFrom, 'emptyDir': {} }});
          backup = new Backup(mockFrom, mockTo, mockPat);
          backup.scanFiles();
          expect(fs.existsSync).toHaveBeenCalled();
          expect(fs.readdirSync.mock.results[0].value.length).toEqual(4);
          expect(backup.scannedFiles.length).toEqual(3);
        });
      });
    });
  });
  describe('Parsing', () => {
    beforeEach(() => {
      mockfs(matchingFiles);
      backup = new Backup(mockFrom, mockTo, mockPat);
      backup.scanFiles();
      expect(backup.scannedFiles.length).toEqual(3);
    });
    afterEach(() => {
      mockfs.restore();
    });
    test('it should parse some files from a scanned files list', () => {
      backup.prepareFiles();
      expect(backup.parsedFiles.length).toEqual(3);
    });
  });
  describe('Copying', () => {
    describe('Some files parsed', () => {
      beforeEach(() => {
        mockfs({...matchingFiles, ...backupFiles });
        backup = new Backup(mockFrom, mockTo, mockPat);
        backup.scanFiles();
        backup.prepareFiles();
      });
      afterEach(() => {
        mockfs.restore();
      });
      test('it should copy some files from a parsed files list', () => {
        backup.copyFiles();
        expect(backup.copiedFiles.length).toEqual(3);
      });
    });
  });
  describe('Archiving', () => {
    beforeEach(() => {
      backup = new Backup(mockFrom, mockTo, mockPat);
      filesystem.archive = jest.fn().mockImplementation(() => ({
        tarFile: () => {},
        size: 420,
      }));
    });
    describe('Some files copied', () => {
      beforeEach(() => {
        mockfs({...matchingFiles, mockTo: { ...backupFiles, 'Arch253370764800000.tar' :'mockContent'} });
        backup.scanFiles();
        backup.prepareFiles();
        backup.copyFiles();
      });
      afterEach(() => {
        mockfs.restore();
      });
      test('it should archive some files from a copied files list', async () => {
        await expect(() => backup.archiveFiles()).not.toThrow();
        expect(backup.tarFile).toHaveProperty("size", 420);
      });
    });
  });
  describe('Cleaning', () => {
    beforeEach(() => {
      backup = new Backup(mockFrom, mockTo, mockPat);
    });
    describe('Some files copied', () => {
      beforeEach(() => {
        mockfs({...matchingFiles, mockTo: { ...backupFiles, 'Arch253370764800000.tar' :'mockContent'} });
        backup.scanFiles();
        backup.prepareFiles();
        backup.copyFiles();
        backup.archiveFiles();
      });
      afterEach(() => {
        mockfs.restore();
      });
      test('it should clean copied files', () => {
        backup.cleanFiles();
      });
    });
  });
});
