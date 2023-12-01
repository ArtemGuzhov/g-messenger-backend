import { IsNotEmpty, IsUUID } from 'class-validator'

export class InviteUserDTO {
  @IsUUID(4)
  @IsNotEmpty()
  inviteChatId: string

  @IsUUID(4)
  @IsNotEmpty()
  profileId: string

  @IsUUID(4)
  @IsNotEmpty()
  clientId: string
}
