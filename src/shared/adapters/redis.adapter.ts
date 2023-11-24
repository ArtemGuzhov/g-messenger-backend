import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { ServerOptions } from 'socket.io'

import { environment } from '../environment'

const {
  redis: { host, port },
} = environment

const pubClient = createClient({
  url: `redis://${host}:${port}`,
})

const subClient = pubClient.duplicate()
const redisAdapter = createAdapter(pubClient, subClient)

export class RedisAdapter extends IoAdapter {
  public override createIOServer(port: number, options?: ServerOptions): unknown {
    const server = super.createIOServer(port, options)

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      server.adapter(redisAdapter)
    })

    return server
  }
}
