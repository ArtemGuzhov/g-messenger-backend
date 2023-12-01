import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator'

import { MessageInviteStatusEnum } from '../../messages/enums/message-invite-status.enum'
import { ChatIdDTO } from './chat-id.dto'

export class AnswerOnInviteDTO extends ChatIdDTO {
  @IsUUID(4)
  @IsNotEmpty()
  inviteChatId: string

  @IsUUID(4)
  @IsNotEmpty()
  messageId: string

  @IsEnum(MessageInviteStatusEnum)
  @IsNotEmpty()
  inviteStatus: MessageInviteStatusEnum
}
