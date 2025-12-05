import type { PropType } from "vue"
import type { SelectProps as ElSelectProps } from "element-plus/es/components/select/src/select"

export type OptionRecord = Record<string, any>

export type ApiHandler = (params: Record<string, any>) => Promise<OptionRecord[]>

export interface CustomProps {
  /**
   * 远程数据获取函数或接口 URL
   */
  api?: ApiHandler | string
  /**
   * 远程请求参数，支持对象或函数生成
   */
  params?: Record<string, any> | ((payload: Record<string, any>) => Record<string, any>)
  /**
   * 选项标签字段名，兼容后端返回的自定义字段
   * @default 'label'
   */
  labelKey?: string
}

export type FdSelectProps = Omit<Partial<ElSelectProps>, "modelValue"> & CustomProps & {
  modelValue?: ElSelectProps["modelValue"]
  options?: OptionRecord[]
}

export const fdSelectPropOptions = {
  api: { type: [Function, String] as PropType<ApiHandler | string> },
  params: { type: [Object, Function] as PropType<CustomProps["params"]>, default: () => ({}) },
  labelKey: { type: String, default: "label" },
  modelValue: { type: [String, Number, Boolean, Array, Object] as PropType<ElSelectProps["modelValue"]>, default: undefined },
  options: { type: Array as PropType<OptionRecord[]>, default: undefined },
} as const

export const fdSelectEmits = {
  "change": (_value: ElSelectProps["modelValue"], _payload: OptionRecord | OptionRecord[] | undefined) => true,
  "search": (_keyword: string) => true,
  "clear": () => true,
  "update:modelValue": (_value: ElSelectProps["modelValue"]) => true,
}
