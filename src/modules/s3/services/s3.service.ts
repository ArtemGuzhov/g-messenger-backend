import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { S3 } from 'aws-sdk'
import { DeleteObjectsRequest } from 'aws-sdk/clients/s3'
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'

import { environment } from '../../../shared/environment'

@Injectable()
export class S3Service {
  private readonly s3: S3
  private readonly bucket: string

  constructor() {
    const {
      s3: { accessKeyId, secretAccessKey, region, endpoint, bucketName },
    } = environment

    this.s3 = new S3({
      accessKeyId,
      secretAccessKey,
      region,
      endpoint,
    })
    this.bucket = bucketName
  }

  /**
   * Получить файл
   * @param id
   */
  async getFile(id: string): Promise<S3.Types.GetObjectOutput> {
    const params: S3.Types.GetObjectRequest = {
      Bucket: this.bucket,
      Key: id,
    }

    return await this.s3
      .getObject(params)
      .promise()
      .then((data: S3.Types.GetObjectOutput) => {
        return data
      })
      .catch((error) => {
        throw error
      })
  }

  /**
   * Сохранить файл
   * @param key
   * @param mimetype
   * @param file
   * @returns ManagedUpload.SendData
   */
  async saveFile(
    key: string,
    mimetype: string,
    file: Buffer,
  ): Promise<ManagedUpload.SendData> {
    const params: S3.Types.PutObjectRequest = {
      ACL: 'public-read',
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimetype,
    }

    return new Promise((resolve) => {
      this.s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
          throw new InternalServerErrorException('S3 uploading error: ' + err.message)
        }

        resolve(this.fixProtocol(data))
      })
    })
  }

  /**
   * Удалить файлы
   * @param names
   * @returns S3.Types.DeleteObjectsOutput
   */
  async removeFiles(names: string[]): Promise<S3.Types.DeleteObjectsOutput> {
    const params: DeleteObjectsRequest = {
      Bucket: this.bucket,
      Delete: {
        Objects: names.map((name) => ({
          Key: name,
        })),
      },
    }

    return new Promise((resolve) => {
      this.s3.deleteObjects(params, (err, data) => {
        if (err) {
          throw new InternalServerErrorException('S3 deleting error: ' + err.message)
        }

        resolve(data)
      })
    })
  }

  /**
   * S3 возвращает http ссылку вместо https у некоторых файлов (видео), из-за этого браузеры блокируют скачивание
   * @param data
   * @returns ManagedUpload.SendData
   */
  private fixProtocol(data: ManagedUpload.SendData): ManagedUpload.SendData {
    if (data.Location.search(/http:\/\//) === 0) {
      data.Location = data.Location.replace('http://', 'https://')

      return data
    }

    return data
  }
}
