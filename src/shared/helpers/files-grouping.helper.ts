interface FileGrouped {
  file: Express.Multer.File
  crop?: Express.Multer.File
}

const filesGrouping = (files: Express.Multer.File[]): FileGrouped[] => {
  const filesGroups: Record<string, FileGrouped> = {}

  for (const file of files) {
    const name = file.originalname

    if (name.includes('crop')) {
      const parseName = name.replace('-crop', '')
      !filesGroups[parseName] && Reflect.set(filesGroups, parseName, {})

      const currentData = filesGroups[parseName]
      if (currentData && !currentData.crop) {
        currentData.crop = file
      }
    } else {
      !filesGroups[name] && Reflect.set(filesGroups, name, {})

      const currentData = filesGroups[name]
      if (currentData && !currentData.file) {
        currentData.file = file
      }
    }
  }

  return Object.values(filesGroups)
}
export default filesGrouping
