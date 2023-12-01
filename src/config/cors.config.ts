import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

const MAX_AGE = 86400

export const corsConfig: CorsOptions = {
  origin: '*',
  credentials: true,
  maxAge: MAX_AGE,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  optionsSuccessStatus: 200,
}
