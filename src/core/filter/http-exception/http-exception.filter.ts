import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { LoggerService } from '@/module/monitor/logger/logger.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {} // 注入 LoggerService

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp() // 获取请求上下文
    const response = ctx.getResponse() // 获取请求上下文中的 response 对象
    const request = ctx.getRequest() // 获取请求上下文中的 request 对象
    const status = exception.getStatus() // 获取异常状态码
    const exceptionResponse: any = exception.getResponse()

    // 获取请求的更多信息
    const { method, url } = request

    let validMessage = ''

    if (typeof exceptionResponse === 'object') {
      validMessage =
        typeof exceptionResponse.message === 'string' ? exceptionResponse.message : exceptionResponse.message[0]
    }
    const message = exception.message ? exception.message : `${status >= 500 ? 'Service Error' : 'Client Error'}`

    const errorResponse = {
      code: status || -1, // 使用异常状态码作为 code
      msg: validMessage || message,
    }

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status)
    response.header('Content-Type', 'application/json; charset=utf-8')
    response.send(errorResponse)

    this.logger.log('request_error', {
      url,
      method,
    })

    this.logger.log('response_error', {
      url,
      method,
      statusCode: status,
      msg: validMessage || message,
      ...errorResponse,
    })
  }
}
