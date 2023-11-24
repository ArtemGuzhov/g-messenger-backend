import { Injectable } from '@nestjs/common'
import crypto from 'crypto'
import randomString from 'randomstring'

@Injectable()
export class CryptoService {
  /**
   * Генерация хэша для пароля
   * @param password
   * @param salt
   * @returns string
   */
  getPasswordHash(password: string, salt: string): string {
    return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')
  }

  /**
   * Генерация соли и хэша пароля
   * @param password
   * @param saltLength
   * @returns { salt, hash, password }
   */
  generatePasswordData(
    password: string,
    saltLength: number,
  ): { salt: string; hash: string; password: string } {
    const salt = this.generateRandomString(saltLength)
    const hash = this.getPasswordHash(password, salt)
    return { salt, hash, password }
  }

  /**
   * Генерация хэша
   * @param value
   * @returns string
   */
  generateHash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex')
  }

  /**
   * Сравнения хэшей
   * @param value
   * @param hash
   * @returns boolean
   */
  compareHash(value: string, hash: string): boolean {
    const hashValue = this.generateHash(value)

    if (hashValue === hash) {
      return true
    }

    return false
  }

  comparePasswordHash(password: string, salt: string, hash: string): boolean {
    const passHash = this.getPasswordHash(password, salt)

    if (passHash === hash) {
      return true
    }

    return false
  }

  /**
   * Генерация рандомной строки
   * @param length
   * @returns string
   */
  generateRandomString(length: number): string {
    return randomString.generate({ length })
  }

  /**
   * Генерация рандомной числовой строки
   * @param length
   * @returns string
   */
  generateRandomNumericString(length: number): string {
    return randomString.generate({ charset: 'numeric', length })
  }
}
