import { Injectable } from '@nestjs/common'
import { ResultData } from '@/common/utils/result'

@Injectable()
export class AppService {
  constructor() {}
  getHi(): string {
    return 'Hi!'
  }

  getHello() {
    return ResultData.ok('Hello World!')
  }
}
