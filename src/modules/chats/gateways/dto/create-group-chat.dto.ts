import { ArrayMinSize, IsArray, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateGroupChatDTO {
  @IsArray()
  @ArrayMinSize(2)
  @IsNotEmpty()
  profilesIds: string[]

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  name: string
}
