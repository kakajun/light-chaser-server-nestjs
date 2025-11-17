import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable, tap } from 'rxjs'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const request = context.switchToHttp().getRequest()
    const { method, url, headers, body, query, params } = request

    const mask = (v: any) => {
      if (!v || typeof v !== 'object') return v
      const a = Array.isArray(v) ? [...v] : { ...v }
      const keys = Object.keys(a)
      for (const k of keys) {
        const val = a[k]
        if (typeof val === 'object' && val) a[k] = mask(val)
        if (/authorization|password|token/i.test(k)) a[k] = '[redacted]'
      }
      return a
    }

    this.logger.log('request', {
      url,
      method,
      headers: headers ? mask({ authorization: headers.authorization }) : undefined,
      body: body ? mask(body) : undefined,
      query: query ? mask(query) : undefined,
      params: params ? mask(params) : undefined,
    })

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now
        this.logger.log('response', {
          url,
          method,
          responseTime: `${responseTime}ms`,
          statusCode: data?.statusCode || 200,
          code: 0,
          msg: 'success',
        })
      }),

      // map((data) => {
      //   return {
      //     code: 0,
      //     msg: 'success',
      //     data,
      //   }
      // }),
    )
  }
}
