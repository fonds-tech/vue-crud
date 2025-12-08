/**
 * @file types.ts
 * @description fd-dialog 对话框组件类型定义
 *
 * 包含组件对外暴露的接口类型定义
 */
import type { Ref } from "vue"

/**
 * 对话框组件暴露的方法和状态接口
 * 通过 ref 引用组件实例后可访问这些属性和方法
 *
 * @example
 * ```vue
 * <fd-dialog ref="dialogRef" />
 *
 * <script setup>
 * const dialogRef = ref<DialogExpose>()
 * dialogRef.value?.open()  // 打开对话框
 * </script>
 * ```
 */
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
