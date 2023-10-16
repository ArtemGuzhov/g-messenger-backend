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
}
