import { SetMetadata } from '@nestjs/common'

export const IsPublic = (): any => SetMetadata('isPublic', true)
