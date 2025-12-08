import type { PropType } from "vue"

/**
 * 创建字符串类型 prop
 * @param defaultValue 默认值
 * @example
 * props: {
 *   type: makeStringProp<'primary' | 'success'>('primary'),
 * }
 */
export function makeStringProp<T extends string>(defaultValue: T) {
  return {
    type: String as unknown as PropType<T>,
    default: defaultValue,
  }
}

/**
 * 创建数字类型 prop
 * @param defaultValue 默认值
 */
export function makeNumberProp(defaultValue: number) {
  return {
    type: Number,
    default: defaultValue,
  }
}

/**
 * 创建布尔类型 prop
 * @param defaultValue 默认值
 */
export function makeBooleanProp(defaultValue = false) {
  return {
    type: Boolean,
    default: defaultValue,
  }
}

/**
 * 创建数组类型 prop
 */
export function makeArrayProp<T>() {
  return {
    type: Array as PropType<T[]>,
    default: () => [] as T[],
  }
}

/**
 * 创建对象类型 prop
 */
export function makeObjectProp<T extends object>() {
  return {
    type: Object as PropType<T>,
    default: () => ({}) as T,
  }
}

/**
 * 创建函数类型 prop
 */
export function makeFunctionProp<T extends (...args: any[]) => any>() {
  return {
    type: Function as PropType<T>,
    default: undefined,
  }
}

/**
 * 创建必填 prop
 * @param type prop 类型
 */
export function makeRequiredProp<T>(type: PropType<T>) {
  return {
    type,
    required: true as const,
  }
}

/**
 * 创建带选项的字符串 prop
 * @param options 可选值数组
 * @param defaultValue 默认值
 */
export function makeEnumProp<T extends string>(options: readonly T[], defaultValue: T) {
  return {
    type: String as unknown as PropType<T>,
    default: defaultValue,
    validator: (value: string) => options.includes(value as T),
  }
}
