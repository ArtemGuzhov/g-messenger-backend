import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateChatDTO {
  @IsString()
  @IsOptional()
  name?: string

  @IsUUID(4)
  @IsOptional()
  fileId?: string

  @IsUUID(4, { each: true })
  @IsNotEmpty()
  userIds: string[]
}
