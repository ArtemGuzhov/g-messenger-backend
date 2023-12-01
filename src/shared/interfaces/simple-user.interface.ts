import { SimpleFile } from './simple-file.interface'

export interface SimpleUser {
  id: string
  avatar: SimpleFile | null
  name: string
  label: string
}
