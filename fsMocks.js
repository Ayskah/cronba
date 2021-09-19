fsMocks = {
  nonMatchingFiles: {
    'matchingPattern1.exe': 'mockContent',
    'matchingPattern2.pdf': 'mockContent',
    'matchingPattern3.apk': 'mockContent',
  },
  matchingFiles: {
    'matchingPattern1.exe': 'mockContent',
    'matchingPattern2.pdf': 'mockContent',
    'matchingPattern3.apk': 'mockContent',
  },
  baseStructure: {
    'mockFrom': {},
    'mockTo': {}
  },
  backupFiles: {
    'mockFrom': {},
    'mockTo': {
      ...this.matchingFiles
    },
  },
  nonMatchingFiles: {
    'mockFrom': {
      ...this.nonMatchingFiles
    },
    'mockTo': {}
  },
}

module.exports = fsMocks;