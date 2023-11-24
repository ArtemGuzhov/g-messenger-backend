import { UseInterceptors } from '@nestjs/common'

import { ResponseInterceptor } from '../interceptors/response.interceptor'

export const TransformResponse = (): MethodDecorator => {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    UseInterceptors(ResponseInterceptor)(target, key, descriptor)
    return descriptor
  }
}
