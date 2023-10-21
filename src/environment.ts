import { config, parse } from 'dotenv'
import * as env from 'env-var'
import { readFileSync } from 'fs'
import { join } from 'path'

config()

const loadEnv =
  process.env.NODE_ENV === 'test'
    ? parse(readFileSync(join(__dirname, '..', '.jest', '.env.test')))
    : {}
Object.assign(process.env, loadEnv)

export const environment = {
  app: {
    production: env.get('NODE_ENV').default('development').asString() === 'production',
    port: env.get('PORT').required().default('3000').asPortNumber(),
  },
  database: {
    host: env.get('PSQL_HOST').required().default('localhost').asString(),
    port: env.get('PSQL_PORT').required().default('3000').asPortNumber(),
    name: env.get('PSQL_DATABASE').required().asString(),
    username: env.get('PSQL_USERNAME').required().asString(),
    password: env.get('PSQL_PASSWORD').required().asString(),
  },
  tokenKeys: {
    accessKey: env.get('ACCESS_TOKEN_KEY').required().asString(),
    refreshKey: env.get('REFRESH_TOKEN_KEY').required().asString(),
    accessTokenExpiresIn: env.get('ACCESS_TOKEN_EXPIRES_IN').required().asInt(),
    refreshTokenExpiresIn: env.get('REFRESH_TOKEN_EXPIRES_IN').required().asInt(),
  },
}
