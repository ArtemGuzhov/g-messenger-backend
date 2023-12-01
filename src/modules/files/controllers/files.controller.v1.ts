import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'

import { IsPublic } from '../../auth/decorators/is-public.decorator'
import { FilesEntity } from '../entities/files.entity'
import { FilesService } from '../services/files.service'

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesControllerV1 {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Получить файл' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @Get(':fileId')
  async getFile(
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Res() res: Response,
  ): Promise<Response | undefined | void> {
    return await this.filesService.getFileFromServer(fileId, res)
  }

  @IsPublic()
  @ApiOperation({ summary: 'Загрузить файлы' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'string', format: 'binary' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async filesUpload(@UploadedFile() file: Express.Multer.File): Promise<FilesEntity> {
    return await this.filesService.upload(file, true)
  }
}
