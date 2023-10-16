import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { environment } from './environment'
import { Logardian } from 'logardian'

const logger = new Logardian()

async function bootstrap(): Promise<void> {
  const { port } = environment.app
  logger.configure({})

  const app = await NestFactory.create(AppModule, {
    logger,
  })
  await app.listen(port)
}
bootstrap()
