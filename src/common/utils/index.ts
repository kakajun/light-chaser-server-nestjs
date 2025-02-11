import * as Lodash from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear' // 导入插件
import timezone from 'dayjs/plugin/timezone' // 导入插件
import utc from 'dayjs/plugin/utc' // 导入插件
import 'dayjs/locale/zh-cn' // 导入本地化语言

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isLeapYear) // 使用插件
dayjs.locale('zh-cn') // 使用本地化语言
dayjs.tz.setDefault('Asia/Beijing')

/**
 * 数组转树结构
 * @param arr
 * @param getId
 * @param getLabel
 * @returns
 */
export function ListToTree(arr, getId, getLabel) {
  const kData = {} // 以id做key的对象 暂时储存数据
  const lData = [] // 最终的数据 arr

  arr.forEach((m) => {
    m = {
      id: getId(m),
      label: getLabel(m),
      parentId: +m.parentId,
    }
    kData[m.id] = {
      id: m.id,
      label: m.label,
      parentId: m.parentId,
    }
    if (m.parentId === 0) {
      lData.push(kData[m.id])
    } else {
      kData[m.parentId] = kData[m.parentId] || {}
      kData[m.parentId].children = kData[m.parentId].children || []
      kData[m.parentId].children.push(kData[m.id])
    }
  })
  return lData
}

/**
 * 获取当前时间
 * YYYY-MM-DD HH:mm:ss
 * @returns
 */
export function GetNowDate() {
  console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'), "dayjs().format('YYYY-MM-DD HH:mm:ss')")
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export function getLocalTimeAsUTC(): Date {
  const localTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
  const [date, time] = localTime.split(' ')
  const [year, month, day] = date.split('/').map(Number)
  const [hour, minute, second] = time.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second))
}

export function getLocalTimeAsUTCB(): Date {
  const localTime = dayjs().add(8, 'hour').toDate()
  return localTime
}

/**
 * 时间格式化
 * @param date
 * @param format
 * @returns
 */
export function FormatDate(date: Date, format = 'YYYY-MM-DD HH:mm:ss') {
  return date && dayjs(date).format(format)
}

/**
 * 深拷贝
 * @param obj
 * @returns
 */
export function DeepClone(obj: object) {
  return Lodash.cloneDeep(obj)
}

/**
 * 生成唯一id
 * UUID
 * @returns
 */
export function GenerateUUID(): string {
  const uuid = uuidv4()
  return uuid.replaceAll('-', '')
}

/**
 * 数组去重
 * @param list
 * @returns
 */
export function Uniq(list: Array<number | string>) {
  return Lodash.uniq(list)
}

/**
 * 分页
 * @param data
 * @param pageSize
 * @param current
 * @returns
 */
export function Paginate(data: { list: Array<any>; pageSize: number; current: number }, filterParam: any) {
  // 检查 pageSize 和 pageNumber 的合法性
  if (data.pageSize <= 0 || data.current < 0) {
    return []
  }

  // 将数据转换为数组
  let arrayData = Lodash.toArray(data.list)

  if (Object.keys(filterParam).length > 0) {
    arrayData = Lodash.filter(arrayData, (item) => {
      const arr = []
      if (filterParam.ipaddr) {
        arr.push(Boolean(item.ipaddr.includes(filterParam.ipaddr)))
      }

      if (filterParam.userName && item.username) {
        arr.push(Boolean(item.username.includes(filterParam.userName)))
      }
      return !Boolean(arr.includes(false))
    })
  }

  // 获取指定页的数据
  const pageData = arrayData.slice((data.current - 1) * data.pageSize, data.current * data.pageSize)

  return pageData
}
