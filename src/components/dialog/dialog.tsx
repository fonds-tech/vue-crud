import type { ExtractPropTypes } from "vue"
import IconTablerMaximize from "~icons/tabler/maximize"
import IconTablerMinimize from "~icons/tabler/minimize"
import { ElDialog, dialogProps } from "element-plus"
import { renderFooter, renderHeader, renderContent } from "./render"
import { ref, watch, computed, useAttrs, useSlots, defineComponent } from "vue"
import "./style.scss"

/**
 * 对话框扩展属性配置
 * 在 Element Plus dialogProps 基础上新增的自定义属性
 */
const dialogExtraProps = {
  /** 内容区域高度，"auto" 时自适应 */
  height: { type: [Number, String], default: "auto" },
  /** 内容区域最大高度，height="auto" 时生效 */
  maxHeight: { type: [Number, String], default: "60vh" },
}

type DialogProps = ExtractPropTypes<typeof dialogProps> & ExtractPropTypes<typeof dialogExtraProps>
export default defineComponent({
  name: "fd-dialog",
  inheritAttrs: false,
  props: { ...dialogProps, ...dialogExtraProps },
  emits: {
    "open": () => true,
    "opened": () => true,
    "close": () => true,
    "closed": () => true,
    "update:modelValue": (value: boolean) => typeof value === "boolean",
    "openAutoFocus": () => true,
    "closeAutoFocus": () => true,
  },

  setup(props, { emit, expose }) {
    // ========== 插槽与属性 ==========
    const slots = useSlots()
    const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }

    // ========== 响应式状态 ==========
    /** 对话框可见性状态，与 v-model 双向绑定 */
    const dialogVisible = ref(Boolean(props.modelValue))
    /** 全屏状态 */
    const fullscreenActive = ref(Boolean(props.fullscreen))

    // ========== 计算属性：CSS 类名与属性绑定 ==========
    /**
     * 对话框 CSS 类名数组
     * 合并默认类名与用户传入的额外类名
     */
    const dialogCssClass = computed(() => {
      const extraClass = attrs.class
      return extraClass ? ["fd-dialog", extraClass] : ["fd-dialog"]
    })

    /**
     * 原生属性过滤
     * 排除 class 属性，避免与 dialogCssClass 冲突
     */
    const dialogNativeAttrs = computed(() => {
      const result: Record<string, unknown> = {}
      Object.keys(attrs).forEach((key) => {
        if (key === "class") return
        result[key] = attrs[key]
      })
      return result
    })

    /**
     * 对话框属性绑定
     * 合并 props 与过滤后的原生属性
     */
    const dialogPropBindings = computed(() => ({
      ...props,
      ...dialogNativeAttrs.value,
    }))

    // ========== 工具函数 ==========
    /**
     * 解析尺寸值
     * 支持数字自动转换为 px，字符串直接返回
     * @param value 尺寸值（数字或字符串）
     * @param fallback 默认值
     */
    function parseSizeValue(value: number | string | undefined | null, fallback: string): string {
      if (typeof value === "number") return `${value}px`
      if (value === undefined || value === null || value === "") return fallback
      const numeric = Number(value)
      if (!Number.isNaN(numeric) && String(numeric) === String(value)) return `${numeric}px`
      return value
    }

    // ========== 计算属性：高度控制 ==========
    /** 是否为自适应高度模式 */
    const isAutoHeight = computed(() => (props as DialogProps).height === "auto")
    /** 固定高度（非自适应模式下使用） */
    const scrollbarHeight = computed(() => isAutoHeight.value ? undefined : parseSizeValue((props as DialogProps).height, "60vh"))
    /** 最大高度（自适应模式下使用） */
    const scrollbarMaxHeight = computed(() => isAutoHeight.value ? parseSizeValue((props as DialogProps).maxHeight, "60vh") : undefined)

    // ========== 计算属性：全屏与关闭按钮 ==========
    /** 全屏按钮提示文本 */
    const fullscreenLabel = computed(() => fullscreenActive.value ? "退出全屏" : "全屏")
    /** 全屏按钮图标组件 */
    const fullscreenIcon = computed(() => fullscreenActive.value ? IconTablerMinimize : IconTablerMaximize)
    /** 是否显示关闭按钮 */
    const showClose = computed(() => props.showClose !== false)

    // ========== 事件处理函数 ==========
    /**
     * 处理 v-model 更新
     * 同步内部状态并触发事件
     */
    function handleModelValueUpdate(value: boolean) {
      dialogVisible.value = value
      emit("update:modelValue", value)
    }

    /** 切换全屏状态 */
    function handleToggleFullscreen() {
      fullscreenActive.value = !fullscreenActive.value
    }

    /** 关闭按钮点击处理 */
    function handleCloseClick() {
      dialogVisible.value = false
      emit("update:modelValue", false)
    }

    // ========== 暴露方法 ==========
    /** 打开对话框 */
    function open() {
      dialogVisible.value = true
      emit("update:modelValue", true)
    }

    /** 关闭对话框 */
    function close() {
      dialogVisible.value = false
      emit("update:modelValue", false)
    }

    /**
     * 设置或切换全屏状态
     * @param value 可选，传入布尔值则强制设置，否则切换
     */
    function fullscreen(value?: boolean) {
      if (typeof value === "boolean") {
        fullscreenActive.value = value
        return
      }
      handleToggleFullscreen()
    }

    // ========== 侦听器 ==========
    watch(() => props.modelValue, val => dialogVisible.value = Boolean(val))
    watch(() => props.fullscreen, val => fullscreenActive.value = Boolean(val))

    expose({ open, close, fullscreen, dialogVisible, fullscreenActive })

    return () => {
      const ctx = {
        title: props.title,
        showClose: showClose.value,
        fullscreenLabel: fullscreenLabel.value,
        fullscreenIcon: fullscreenIcon.value,
        scrollbarHeight: scrollbarHeight.value,
        scrollbarMaxHeight: scrollbarMaxHeight.value,
        slots,
        onToggleFullscreen: handleToggleFullscreen,
        onClose: handleCloseClick,
      }

      return (
        <ElDialog
          {...dialogPropBindings.value}
          class={dialogCssClass.value}
          fullscreen={fullscreenActive.value}
          showClose={false}
          modelValue={dialogVisible.value}
          onUpdate:modelValue={handleModelValueUpdate}
          onOpen={() => emit("open")}
          onOpened={() => emit("opened")}
          onClose={() => emit("close")}
          onClosed={() => emit("closed")}
          onOpenAutoFocus={() => emit("openAutoFocus")}
          onCloseAutoFocus={() => emit("closeAutoFocus")}
        >
          {{
            header: () => renderHeader(ctx),
            default: () => renderContent(ctx),
            footer: () => renderFooter(ctx),
          }}
        </ElDialog>
      )
    }
  },
})
