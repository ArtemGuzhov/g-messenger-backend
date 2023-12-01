import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateMessageDTO {
  @IsUUID(4)
  @IsNotEmpty()
  clientId: string

  @IsUUID(4)
  @IsNotEmpty()
  chatId: string

  @IsString()
  @IsOptional()
  text?: string

  @IsUUID(4, { each: true })
  @IsOptional()
  fileIds?: string[]

  @IsUUID(4)
  @IsOptional()
  repliedToId?: string

  @IsUUID(4)
  @IsOptional()
  rootId?: string
}
