import { DataSource, DataSourceOptions } from 'typeorm'
import { TypeormConfig } from './typeorm.config'

export default new DataSource(
  new TypeormConfig().createTypeOrmOptions() as DataSourceOptions,
)
