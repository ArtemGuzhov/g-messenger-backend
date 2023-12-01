import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { Response } from 'express'
import { S3Service } from 'src/modules/s3/services/s3.service'
import { getFileFormatAndValidate } from 'src/shared/helpers'
import { Readable } from 'stream'
import { EntityManager, In, Repository } from 'typeorm'
import { v4 } from 'uuid'

import { SimpleFile } from '../../../shared/interfaces/simple-file.interface'
import { FilesEntity } from '../entities/files.entity'
import { FileFormat } from '../enums/file-format.enum'

@Injectable()
export class FilesService {
  private readonly repository: Repository<FilesEntity>

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly s3Service: S3Service,
  ) {
    this.repository = this.entityManager.getRepository(FilesEntity)
  }

  async getFileById(id: string): Promise<FilesEntity> {
    const file = await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        crop: true,
      },
    })

    if (file === null) {
      throw new NotFoundException('File not found')
    }

    return file
  }

  async getFileFromServer(
    id: string,
    res: Response,
  ): Promise<Response | undefined | void> {
    const existFile = await this.repository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        path: true,
      },
    })

    if (existFile === null) {
      throw new NotFoundException('File not found')
    }

    const file = await this.s3Service.getFile(id)

    if (existFile.format === FileFormat.VIDEO) {
      const videoStream = Readable.from(file.Body as string)

      videoStream.on('data', (chunk) => {
        res.write(chunk)
      })

      videoStream.on('end', () => {
        res.end()
      })
    } else {
      res.setHeader('Content-Type', file.ContentType ?? '')
      res.send(file.Body)
    }
  }

  async getSimpleFiles(ids: string[]): Promise<SimpleFile[]> {
    const files = await this.repository.find({
      where: {
        id: In(ids),
      },
      select: {
        id: true,
        format: true,
        mimetype: true,
      },
    })
    return files
  }

  async upload(file: Express.Multer.File, isValidate = false): Promise<FilesEntity> {
    if (!file) {
      throw new NotFoundException()
    }

    const fileId = v4()
    const fileFormat = getFileFormatAndValidate(file, isValidate)

    const [s3FileRes] = await Promise.all([
      this.s3Service.saveFile(fileId, file.mimetype, file.buffer),
    ])

    const newFile = this.repository.create({
      id: fileId,
      path: s3FileRes.Location,
      mimetype: file.mimetype,
      size: file.size,
      format: fileFormat,
    })
    return this.repository.save(newFile)
  }

  async removeFiles(files: FilesEntity[]): Promise<void> {
    const ids = []

    for (const file of files) {
      file.crop !== null && ids.push(file.crop.id)
      ids.push(file.id)
    }

    ids.length && (await this.s3Service.removeFiles(ids))
    await this.repository.remove(files)
  }

  async linkingFiles(ids: string[]): Promise<void> {
    await this.repository.update({ id: In(ids) }, { isLinked: true })
  }
}
