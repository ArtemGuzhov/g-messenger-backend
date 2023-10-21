import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { environment } from 'src/environment'

export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
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
      entities: [`${__dirname}/../modules/**/entities/*.entity.{js,ts}`],
      migrationsTableName: 'migrations',
      migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
    }
  }
}
