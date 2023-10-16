import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './modules/prisma/prisma.module'
import { UsersModule } from './modules/users/users.module'
import { ChatsModule } from './modules/chats/chats.module'
import { MessagesModule } from './modules/messages/messages.module'
import { ApolloDriverConfig } from '@nestjs/apollo'
import { GraphQLModule } from '@nestjs/graphql'
import { graphQlConfig } from './config/graphql.config'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphQlConfig),
    PrismaModule,
    UsersModule,
    ChatsModule,
    MessagesModule,
  ],
})
export class AppModule {}
