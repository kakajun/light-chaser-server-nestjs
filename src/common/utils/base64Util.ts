export class Base64Util {
  static encode(str: string): string {
    return Buffer.from(str).toString('base64')
  }

  static decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf-8')
  }
}
