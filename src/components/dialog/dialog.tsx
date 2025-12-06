import type { ExtractPropTypes } from "vue"
import IconTablerX from "~icons/tabler/x"
import IconTablerMaximize from "~icons/tabler/maximize"
import IconTablerMinimize from "~icons/tabler/minimize"
import { ElIcon, ElDialog, ElScrollbar, dialogProps } from "element-plus"
import { ref, watch, computed, useAttrs, useSlots, defineComponent } from "vue"
import "./style.scss"

/* =====================================================================
 * Props 定义
 * ===================================================================== */

/**
 * fd-dialog 扩展属性
 * @description 对 Element Plus Dialog 的扩展配置，补充高度控制等能力
 */
const dialogExtraProps = {
  /**
   * 对话框内容区域高度
   * @type {number | string}
   * @default "60vh"
   * @example
   *   height="400px"    // CSS 字符串
   *   :height="300"     // 数字，自动转为 "300px"
   *   height="50vh"     // 视口高度
   */
  height: {
    type: [Number, String],
    default: "60vh",
  },
}

/**
 * 完整的对话框 Props 类型
 * @description 合并 Element Plus dialogProps 与自定义扩展属性
 */
type DialogProps = ExtractPropTypes<typeof dialogProps> & ExtractPropTypes<typeof dialogExtraProps>

/* =====================================================================
 * 组件定义
 * ===================================================================== */

export default defineComponent({
  /** 组件名称，用于 Vue DevTools 调试和递归组件引用 */
  name: "fd-dialog",

  /**
   * 禁用自动 attrs 继承
   * @description 手动控制 attrs 的传递，避免 class 被覆盖
   */
  inheritAttrs: false,

  /** Props 定义：合并 Element Plus 原生属性与扩展属性 */
  props: {
    ...dialogProps,
    ...dialogExtraProps,
  },

  /**
   * 事件类型声明
   * @description 包含 Element Plus 原生事件与自定义事件
   */
  emits: {
    /** 对话框打开时触发（动画开始前） */
    "open": () => true,
    /** 对话框打开动画完成后触发 */
    "opened": () => true,
    /** 对话框关闭时触发（动画开始前） */
    "close": () => true,
    /** 对话框关闭动画完成后触发 */
    "closed": () => true,
    /** 双向绑定：可见性变化 */
    "update:modelValue": (value: boolean) => typeof value === "boolean",
    /** 对话框打开后自动聚焦时触发 */
    "openAutoFocus": () => true,
    /** 对话框关闭后焦点返回时触发 */
    "closeAutoFocus": () => true,
    /** 双向绑定：全屏状态变化 */
    "update:fullscreen": (value: boolean) => typeof value === "boolean",
  },

  setup(props, { emit, expose }) {
    /* -------------------------------------------------------------------
     * 响应式状态
     * ------------------------------------------------------------------- */

    /** 获取插槽定义 */
    const slots = useSlots()

    /** 获取透传的 attrs（不包含 props 中已声明的属性） */
    const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }

    /**
     * 对话框可见性状态
     * @description 内部维护的可见性状态，与外部 v-model 双向同步
     *              支持受控模式（v-model）与命令式调用（open/close）
     */
    const dialogVisible = ref(Boolean(props.modelValue))

    /**
     * 全屏状态
     * @description 独立存储全屏状态，支持多种触发方式：
     *              - 用户点击全屏按钮
     *              - 外部 props.fullscreen 变化
     *              - 命令式 API fullscreen() 调用
     */
    const fullscreenActive = ref(Boolean(props.fullscreen))

    /**
     * ElDialog 组件引用
     * @description 使用 any 类型以放宽 JSX 的类型约束，
     *              便于透传扩展属性与事件，避免类型过度收窄
     */
    const DialogComp = ElDialog as any

    /* -------------------------------------------------------------------
     * 计算属性
     * ------------------------------------------------------------------- */

    /**
     * 对话框 CSS 类名
     * @description 合并内置类名与用户传入的自定义类名
     */
    const dialogCssClass = computed(() => {
      const extraClass = attrs.class
      return extraClass ? ["fd-dialog", extraClass] : ["fd-dialog"]
    })

    /**
     * 需要透传给 ElDialog 的原生属性
     * @description 过滤掉 class（单独处理），其余 attrs 直接透传
     */
    const dialogNativeAttrs = computed(() => {
      const result: Record<string, unknown> = {}
      Object.keys(attrs).forEach((key) => {
        // class 单独处理，避免覆盖内部 class 计算
        if (key === "class") return
        // 其余 attrs 透传给 ElDialog，保留 Element Plus 全量特性
        result[key] = attrs[key]
      })
      return result
    })

    /**
     * 对话框完整属性绑定
     * @description 合并 props 与透传的原生属性，用于绑定到 ElDialog
     */
    const dialogPropBindings = computed(() => ({
      ...props,
      ...dialogNativeAttrs.value,
    }))

    /**
     * 滚动区域高度
     * @description 解析用户传入的 height 属性，兼容多种格式：
     *              - 数字：自动添加 px 单位
     *              - 数字字符串：自动添加 px 单位
     *              - CSS 字符串：原样返回
     *              - 空值：使用默认值 60vh
     * @returns {string} 解析后的高度字符串
     */
    const scrollbarHeight = computed(() => {
      const { height } = props as DialogProps

      // 纯数值高度强制转 px，避免被 Scrollbar 误判
      if (typeof height === "number") return `${height}px`

      // 空值兜底 60vh，确保内容可滚动
      if (height === undefined || height === null || height === "") return "60vh"

      // 尝试将字符串解析为数字
      const numeric = Number(height)

      // 仅在原值就是纯数字字符串时应用 px（如 "300" -> "300px"）
      // 避免将 "60vh" 误转为 "NaNpx"
      if (!Number.isNaN(numeric) && String(numeric) === String(height)) {
        return `${numeric}px`
      }

      // 其他情况（如 "60vh"、"calc(100% - 100px)"）原样返回
      return height
    })

    /**
     * 全屏按钮的无障碍标签
     * @description 根据当前全屏状态返回对应的操作提示
     */
    const fullscreenButtonLabel = computed(() =>
      fullscreenActive.value ? "退出全屏" : "全屏",
    )

    /**
     * 全屏按钮图标组件
     * @description 全屏时显示"缩小"图标，非全屏时显示"放大"图标
     */
    const fullscreenButtonIcon = computed(() =>
      fullscreenActive.value ? IconTablerMinimize : IconTablerMaximize,
    )

    /**
     * 是否渲染关闭按钮
     * @description 当 showClose 不为 false 时渲染关闭按钮
     */
    const shouldRenderCloseAction = computed(() => props.showClose !== false)

    /* -------------------------------------------------------------------
     * 事件处理函数
     * ------------------------------------------------------------------- */

    /**
     * 处理 ElDialog 的 v-model 更新事件
     * @description 同步内部状态并向上透传事件，保持双向绑定一致性
     * @param {boolean} value - 最新的可见性状态
     */
    function handleModelValueUpdate(value: boolean) {
      // 同步内部状态
      dialogVisible.value = value
      // 向父组件透传，支持 v-model 受控用法
      emit("update:modelValue", value)
    }

    /**
     * 处理 ElDialog 的全屏状态更新事件
     * @description 同步内部全屏状态并向上透传（如 ESC 键退出全屏时触发）
     * @param {boolean} value - 当前全屏状态
     */
    function handleFullscreenUpdate(value: boolean) {
      fullscreenActive.value = value
      emit("update:fullscreen", value)
    }

    /**
     * 切换全屏状态
     * @description 供头部全屏按钮点击时调用
     */
    function handleToggleFullscreen() {
      fullscreenActive.value = !fullscreenActive.value
    }

    /**
     * 处理关闭按钮点击
     * @description 关闭对话框并同步 v-model 状态
     */
    function handleCloseClick() {
      dialogVisible.value = false
      emit("update:modelValue", false)
    }

    /* -------------------------------------------------------------------
     * 命令式 API（通过 expose 暴露给父组件）
     * ------------------------------------------------------------------- */

    /**
     * 打开对话框
     * @description 命令式 API，可通过 ref 直接调用
     * @example
     * ```ts
     * const dialogRef = ref()
     * dialogRef.value?.open()
     * ```
     */
    function open() {
      dialogVisible.value = true
      emit("update:modelValue", true)
    }

    /**
     * 关闭对话框
     * @description 命令式 API，可通过 ref 直接调用
     * @example
     * ```ts
     * const dialogRef = ref()
     * dialogRef.value?.close()
     * ```
     */
    function close() {
      dialogVisible.value = false
      emit("update:modelValue", false)
    }

    /**
     * 控制全屏状态
     * @description 命令式 API，支持切换或强制设置全屏状态
     * @param {boolean} [value] - 可选，传入布尔值强制设置，不传则切换当前状态
     * @example
     * ```ts
     * dialogRef.value?.fullscreen()      // 切换全屏
     * dialogRef.value?.fullscreen(true)  // 进入全屏
     * dialogRef.value?.fullscreen(false) // 退出全屏
     * ```
     */
    function fullscreen(value?: boolean) {
      if (typeof value === "boolean") {
        fullscreenActive.value = value
        return
      }
      handleToggleFullscreen()
    }

    /* -------------------------------------------------------------------
     * 侦听器：同步外部 Props 变化
     * ------------------------------------------------------------------- */

    /**
     * 监听外部 modelValue 变化
     * @description 当父组件通过 v-model 改变可见性时，同步内部状态
     */
    watch(
      () => props.modelValue,
      (val) => {
        dialogVisible.value = Boolean(val)
      },
    )

    /**
     * 监听外部 fullscreen 变化
     * @description 当父组件通过 prop 改变全屏状态时，同步内部状态
     */
    watch(
      () => props.fullscreen,
      (val) => {
        fullscreenActive.value = Boolean(val)
      },
    )

    /* -------------------------------------------------------------------
     * 暴露给父组件的实例成员
     * ------------------------------------------------------------------- */

    /**
     * 通过 expose 暴露的 API
     * @property {Function} open - 打开对话框
     * @property {Function} close - 关闭对话框
     * @property {Function} fullscreen - 控制全屏状态
     * @property {Ref<boolean>} dialogVisible - 当前可见性状态
     * @property {Ref<boolean>} fullscreenActive - 当前全屏状态
     */
    expose({
      open,
      close,
      fullscreen,
      dialogVisible,
      fullscreenActive,
    })

    /* -------------------------------------------------------------------
     * 渲染函数
     * ------------------------------------------------------------------- */

    return () => {
      // 动态获取当前应显示的全屏图标组件
      const FullscreenIcon = fullscreenButtonIcon.value

      return (
        <DialogComp
          {...dialogPropBindings.value}
          class={dialogCssClass.value}
          fullscreen={fullscreenActive.value}
          showClose={false} // 禁用原生关闭按钮，使用自定义头部
          modelValue={dialogVisible.value}
          onUpdate:modelValue={handleModelValueUpdate}
          onUpdate:fullscreen={handleFullscreenUpdate}
          onOpen={() => emit("open")}
          onOpened={() => emit("opened")}
          onClose={() => emit("close")}
          onClosed={() => emit("closed")}
          onOpenAutoFocus={() => emit("openAutoFocus")}
          onCloseAutoFocus={() => emit("closeAutoFocus")}
        >
          {{
            /* 自定义头部插槽：标题 + 操作按钮（全屏/关闭） */
            header: () => (
              <>
                {/* 对话框标题 */}
                <div class="fd-dialog__title">{props.title}</div>

                {/* 操作按钮区域 */}
                <div class="fd-dialog__actions">
                  {/* 全屏切换按钮 */}
                  <div
                    class="fd-dialog__action"
                    role="button"
                    aria-label={fullscreenButtonLabel.value}
                    title={fullscreenButtonLabel.value}
                    onClick={handleToggleFullscreen}
                  >
                    <ElIcon>
                      <FullscreenIcon />
                    </ElIcon>
                  </div>

                  {/* 关闭按钮（可通过 showClose prop 控制显示） */}
                  {shouldRenderCloseAction.value && (
                    <div
                      class="fd-dialog__action"
                      role="button"
                      aria-label="关闭弹窗"
                      title="关闭弹窗"
                      onClick={handleCloseClick}
                    >
                      <ElIcon>
                        <IconTablerX />
                      </ElIcon>
                    </div>
                  )}
                </div>
              </>
            ),

            /* 默认插槽：内容区域，包裹在 ElScrollbar 中 */
            default: () => (
              <ElScrollbar height={scrollbarHeight.value}>
                <div class="fd-dialog__scrollbar" data-height={scrollbarHeight.value}>
                  {slots.default?.()}
                </div>
              </ElScrollbar>
            ),

            /* 底部插槽：透传用户定义的 footer */
            footer: () => slots.footer?.(),
          }}
        </DialogComp>
      )
    }
  },
})
