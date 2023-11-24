import { RedisModuleAsyncOptions } from '@liaoliaots/nestjs-redis'

import { environment } from '../shared/environment'

export const redisConfig: RedisModuleAsyncOptions = {
  useFactory: () => {
    const { port, host, password } = environment.redis

    return {
      config: {
        host,
        port,
        password,
      },
    }
  },
}
