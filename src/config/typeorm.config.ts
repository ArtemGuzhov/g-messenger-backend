import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { environment } from '../shared/environment'

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (): TypeOrmModuleOptions => {
    const { name: database, host, port, username, password } = environment.database

    return {
      type: 'postgres',
      database,
      host,
      port,
      username,
      password,
      synchronize: true,
      keepConnectionAlive: true,
      migrationsRun: true,
      retryAttempts: 10,
      retryDelay: 3000,
      entities: [
        `${__dirname}/../modules/**/entities/*.entity.{js,ts}`,
        `${__dirname}/../shared/entities/*.entity.{js,ts}`,
      ],
      migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
    }
  },
}
