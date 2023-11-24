import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { map, Observable } from 'rxjs'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const code = context.switchToHttp().getResponse()?.statusCode ?? 200
    return next.handle().pipe(
      map((data) => {
        return {
          code,
          message: 'success',
          data,
          error: null,
        }
      }),
    )
  }
}
