import { registerEnumType } from '@nestjs/graphql'

export enum ChatFormat {
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
}
registerEnumType(ChatFormat, {
  name: 'ChatFormat',
})
