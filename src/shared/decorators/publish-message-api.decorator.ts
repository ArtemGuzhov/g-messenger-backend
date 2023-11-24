import { applyDecorators, Type } from '@nestjs/common'
import { AsyncApiPub } from 'nestjs-asyncapi'

export function PublishMessageApi<T>(
  channel: string,
  description: string,
  payload: Type<T>,
): MethodDecorator {
  return applyDecorators(
    AsyncApiPub({
      channel,
      message: {
        name: channel,
        payload: payload,
      },
      description,
      tags: [
        {
          name: 'chats',
        },
      ],
    }),
  )
}
