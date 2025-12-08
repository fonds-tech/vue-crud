import type { Ref } from "vue"

export interface DialogExpose {
  /** 打开对话框，触发 v-model 同步 */
  open: () => void
  /** 关闭对话框，触发 v-model 同步 */
  close: () => void
  /**
   * 切换或设置全屏状态
   * @param value 可选，传入布尔值时强制设置，否则切换
   */
  fullscreen: (value?: boolean) => void
  /** 内部可见性状态引用，镜像 v-model:modelValue */
  dialogVisible: Ref<boolean>
  /** 内部全屏状态引用，镜像 fullscreen prop 与事件 */
  fullscreenActive: Ref<boolean>
}
