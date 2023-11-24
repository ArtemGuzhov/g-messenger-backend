import { Module } from '@nestjs/common'

import { FilesControllerV1 } from './controllers/files.controller.v1'
import { FilesService } from './services/files.service'

@Module({
  controllers: [FilesControllerV1],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
