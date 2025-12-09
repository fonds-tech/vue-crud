/**
 * 组件共享工具模块
 *
 * 提供跨组件通用的工具函数：
 * - resolver: 动态值解析
 * - component: 组件配置解析
 * - dict: 字典匹配工具
 */

// component 模块
export {
  componentIs,
  isConfig,
  parse,
  slotName,
} from "./component"

// dict 模块
export * as dict from "./dict"

// resolver 模块
export {
  resolve,
  resolveProp,
} from "./resolver"
