/**
 * 登录用户 redis key 过期时间
 * 24h
 */
export const LOGIN_TOKEN_EXPIRESIN = 1000 * 60 * 60 * 24

/**
 * 用户类型
 * 00系统用户,10自定义用户
 */
export const enum SYS_USER_TYPE {
  SYS = '00',
  CUSTOM = '10',
}

// src/enums/app-exception-code-msg.enum.ts
export enum AppExceptionCodeMsg {
  SERVER_ERROR = '服务器异常',
  NOT_FOUND = '资源未找到',
  BAD_REQUEST = '请求无效',
  // 其他错误码和消息
}

export const ImageType = ['.bmp', '.jpg', '.jpeg', '.png', '.gif']

export const IMAGE_SIZE = 1024 * 1024 * 5 // 5MB

export const enum FileTypeEnum {
  IMAGE = 1,
  VIDEO = 2,
  MODEL = 3,
}
