import * as dotenv from 'dotenv'
import * as env from 'env-var'
import { readFileSync } from 'fs'
import { join } from 'path'

const loadEnv = dotenv.parse(readFileSync(join(__dirname, '..', '..', '.env')))

Object.assign(process.env, loadEnv)

export const environment = {
  app: {
    producation: env.get('NODE_ENV').default('development').asString() === 'production',
    host: env.get('HOST').required().default('localhost').asString(),
    port: env.get('PORT').required().default('3000').asPortNumber(),
    appId: env.get('APP_ID').required().default('3000').asString(),
  },
  database: {
    host: env.get('PSQL_HOST').required().default('localhost').asString(),
    port: env.get('PSQL_PORT').required().default('3000').asPortNumber(),
    name: env.get('PSQL_DATABASE').required().asString(),
    username: env.get('PSQL_USERNAME').required().asString(),
    password: env.get('PSQL_PASSWORD').required().asString(),
  },
  redis: {
    host: env.get('REDIS_HOST').required().default('localhost').asString(),
    port: env.get('REDIS_PORT').required().default('6739').asPortNumber(),
    password: env.get('REDIS_PASSWORD').required().asString(),
  },
  tokenKeys: {
    accessKey: env.get('ACCESS_TOKEN_KEY').required().asString(),
    refreshKey: env.get('REFRESH_TOKEN_KEY').required().asString(),
    accessTokenExpiresIn: env.get('ACCESS_TOKEN_EXPIRES_IN').required().asString(),
    refreshTokenExpiresIn: env.get('REFRESH_TOKEN_EXPIRES_IN').required().asString(),
  },
  s3: {
    accessKeyId: env.get('S3_ACCESS_KEY').required().asString(),
    secretAccessKey: env.get('S3_SECRET_KEY').required().asString(),
    endpoint: env.get('S3_ENDPOINT').required().asString(),
    region: env.get('S3_REGION').required().asString(),
    bucketName: env.get('S3_BUCKET_NAME').required().asString(),
  },
  crypto: {
    salt: env.get('SALT').required().asString(),
  },
  media: {
    sizes: {
      image: env.get('IMAGE_SIZE').required().default(10).asInt(),
      video: env.get('VIDEO_SIZE').required().default(100).asInt(),
      application: env.get('APPLICATION_SIZE').required().default(10).asInt(),
      audio: env.get('AUDIO_SIZE').required().default(10).asInt(),
    },
  },
}
