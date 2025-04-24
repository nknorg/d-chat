import dayjs from 'dayjs'
import 'dayjs/locale/en.js'
import 'dayjs/locale/zh.js'
import 'dayjs/locale/zh-tw.js'
import { ComponentPublicInstance, getCurrentInstance } from 'vue'

export function formatChatTime(timestamp?: number) {
  const ins = getCurrentInstance()
  const proxy: ComponentPublicInstance = ins!.proxy!
  const now: dayjs.Dayjs = dayjs()
  const time: dayjs.Dayjs = dayjs(timestamp) ?? now

  let timeFormat
  if (now.diff(time, 'day') == 0) {
    // @ts-ignore
    timeFormat = time.locale(proxy.$i18n.locale).format('HH:mm')
  } else if (now.diff(time, 'day') < 7 && now.diff(time, 'week') >= 0) {
    // @ts-ignore
    timeFormat = time.locale(proxy.$i18n.locale).format('ddd HH:mm')
  } else if (now.diff(time, 'day') <= 31 && now.month() == time.month()) {
    // @ts-ignore
    timeFormat = time.locale(proxy.$i18n.locale).format('MMM/D HH:mm')
  } else {
    // @ts-ignore
    timeFormat = time.locale(proxy.$i18n.locale).format('MMM/D/YYYY HH:mm')
  }
  return timeFormat
}
