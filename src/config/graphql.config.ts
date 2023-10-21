import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'

export const graphQlConfig: ApolloDriverConfig = {
  autoSchemaFile: join(process.cwd(), 'schema.gql'),
  sortSchema: true,
  playground: true,
  driver: ApolloDriver,
  fieldResolverEnhancers: ['guards'],
}
