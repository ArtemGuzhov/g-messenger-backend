import { FileFormat } from '../../modules/files/enums/file-format.enum'

export interface SimpleFile {
  id: string
  format: FileFormat
  mimetype: string
  cropId: string | null
}
