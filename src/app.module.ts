import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './modules/users/users.module'
import { ChatsModule } from './modules/chats/chats.module'
import { MessagesModule } from './modules/messages/messages.module'
import { ApolloDriverConfig } from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { graphQlConfig } from './config/graphql.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeormConfig } from './config/typeorm.config'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphQlConfig),
    TypeOrmModule.forRootAsync({ useClass: TypeormConfig }),
    UsersModule,
    ChatsModule,
    MessagesModule,
    AuthModule,
  ],
})
export class AppModule {}
