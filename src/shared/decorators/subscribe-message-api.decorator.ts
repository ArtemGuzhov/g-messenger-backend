import { applyDecorators, Type } from '@nestjs/common'
import { SubscribeMessage } from '@nestjs/websockets'
import { AsyncApiSub } from 'nestjs-asyncapi'

export function SubscribeMessageApi<T>(
  channel: string,
  description: string,
  payload: Type<T>,
): MethodDecorator {
  return applyDecorators(
    SubscribeMessage(channel),
    AsyncApiSub({
      channel,
      message: {
        name: channel,
        payload: payload,
        headers: {
          Authorization: {
            description: 'Access token',
          },
        },
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
