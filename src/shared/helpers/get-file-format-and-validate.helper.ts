import { BadRequestException } from '@nestjs/common'

import { FileFormat } from '../../modules/files/enums/file-format.enum'
import { environment } from '../environment'

const getFileFormatAndValidate = (
  file: Express.Multer.File,
  isValidate = true,
): FileFormat => {
  const format = file.mimetype.split('/')[0]
  const size = Math.floor(file.size / 1_000_000)
  const {
    media: { sizes },
  } = environment

  if (!format) {
    throw new BadRequestException('Image has no format')
  }

  const upperCaseFormat = format.toUpperCase() as FileFormat

  switch (upperCaseFormat) {
    case FileFormat.IMAGE:
      if (size > sizes.image && isValidate) {
        throw new BadRequestException(`File size should not exceed ${sizes.image} MB`)
      }

      return FileFormat.IMAGE
    case FileFormat.AUDIO:
      if (size > sizes.audio && isValidate) {
        throw new BadRequestException(`File size should not exceed ${sizes.audio} MB`)
      }

      return FileFormat.AUDIO
    case FileFormat.VIDEO:
      if (size > sizes.video && isValidate) {
        throw new BadRequestException(`File size should not exceed ${sizes.video} MB`)
      }

      return FileFormat.VIDEO
    case FileFormat.APPLICATION:
      if (size > sizes.application && isValidate) {
        throw new BadRequestException(
          `File size should not exceed ${sizes.application} MB`,
        )
      }

      return FileFormat.APPLICATION
    default:
      throw new BadRequestException('Unsupported format')
  }
}
export default getFileFormatAndValidate
