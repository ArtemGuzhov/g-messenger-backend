import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { Logardian } from 'logardian'
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi'

import { AppModule } from './app.module'
import { corsConfig } from './config/cors.config'
import { helmetConfig } from './config/helmet.config'
import { RedisAdapter } from './shared/adapters/redis.adapter'
import { environment } from './shared/environment'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { ResponseInterceptor } from './shared/interceptors/response.interceptor'
import { TransformInterceptor } from './shared/interceptors/transform.interceprtor'

const logger = new Logardian()

async function bootstrap(): Promise<void> {
  const {
    app: { host, port },
  } = environment

  logger.configure({})

  const app = await NestFactory.create(AppModule, { logger })

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('G-Messenger')
    .setDescription('G-Messenger API')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addBearerAuth()
    .addServer('g-messenger-ws', {
      url: `ws://${host}:${port}`,
      protocol: 'socket.io',
    })
    .build()

  const asyncapiDocument = AsyncApiModule.createDocument(app, asyncApiOptions)
  await AsyncApiModule.setup('/socket/docs', app, asyncapiDocument)

  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
  })

  const swaggerConfig = new DocumentBuilder()
    .setTitle('G-Messenger')
    .setVersion('1.0')
    .setDescription('G-Messenger API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build()
  const swaggerCustomOptioms: SwaggerCustomOptions = {
    customSiteTitle: 'Exapp API',
  }
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptioms)

  app
    .use(helmet(helmetConfig))
    .useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }))
    .useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    .useGlobalFilters(new HttpExceptionFilter())
    .useWebSocketAdapter(new RedisAdapter(app))
    .useGlobalInterceptors(new ResponseInterceptor())
    .useGlobalInterceptors(new TransformInterceptor())
    .enableCors(corsConfig)

  await app.listen(port, host, () =>
    logger.log(`Server running at http://${host}:${port}`),
  )
}
bootstrap()
