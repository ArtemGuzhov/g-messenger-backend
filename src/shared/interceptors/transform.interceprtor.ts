import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { instanceToPlain } from 'class-transformer'
import { map, Observable } from 'rxjs'

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Record<string, unknown>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Record<string, unknown>> {
    return next.handle().pipe(map((data) => instanceToPlain(data)))
  }
}
