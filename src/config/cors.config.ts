const MAX_AGE = 86400

export const corsConfig = {
  origin: '*',
  credentials: true,
  maxAge: MAX_AGE,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  optionsSuccessStatus: 200,
}
