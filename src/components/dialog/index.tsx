import type { DialogEmits } from "element-plus/es/components/dialog/src/dialog"
import { Close, FullScreen, ScaleToOriginal } from "@element-plus/icons-vue"
import { ElDialog, dialogEmits, dialogProps } from "element-plus"
import { ref, watch, computed, defineComponent } from "vue"

export default defineComponent({
  name: "fd-dialog",
  inheritAttrs: false,
  props: {
    ...dialogProps,
    height: {
      type: [Number, String],
      default: "60vh",
    },
  },
  emits: dialogEmits,
  setup(props, { emit, slots, attrs, expose }) {
    const emitEvent = (name: keyof DialogEmits, ...args: any[]) => {
      // @ts-expect-error
      emit(name, ...args)
    }

    const visible = ref(props.modelValue)

    const onModelValueChange = (value: boolean) => {
      visible.value = value
      emitEvent("update:modelValue", value)
    }

    watch(
      () => props.modelValue,
      (val) => {
        visible.value = Boolean(val)
      },
    )

    const isFullscreen = ref(props.fullscreen)

    watch(
      () => props.fullscreen,
      (val) => {
        isFullscreen.value = val
      },
    )

    const toggleFullscreen = () => {
      isFullscreen.value = !isFullscreen.value
    }

    const handleClose = () => {
      visible.value = false
      emitEvent("update:modelValue", false)
    }

    const contentHeight = computed(() => {
      const { height } = props
      if (height === undefined || height === null || height === "") {
        return undefined
      }
      return typeof height === "number" ? `${height}px` : height
    })

    const open = () => {
      visible.value = true
      emitEvent("update:modelValue", true)
    }

    const close = () => {
      visible.value = false
      emitEvent("update:modelValue", false)
    }

    const fullscreen = (value?: boolean) => {
      if (typeof value === "boolean") {
        isFullscreen.value = value
      }
      else {
        toggleFullscreen()
      }
    }

    expose({
      open,
      close,
      fullscreen,
      visible,
      isFullscreen,
    })

    const renderHeader = () => {
      const showClose = props.showClose !== false
      const FullscreenIcon = isFullscreen.value ? ScaleToOriginal : FullScreen
      const fullscreenLabel = isFullscreen.value ? "退出全屏" : "全屏"

      return (
        <div class="fd-dialog__header">
          <div class="fd-dialog__title">
            {props.title}
          </div>
          <div class="fd-dialog__actions">
            <el-button
              class="fd-dialog__action"
              text
              circle
              aria-label={fullscreenLabel}
              title={fullscreenLabel}
              onClick={toggleFullscreen}
            >
              <el-icon>
                <FullscreenIcon />
              </el-icon>
            </el-button>
            {showClose && (
              <el-button class="fd-dialog__action" text circle onClick={handleClose}>
                <el-icon>
                  <Close />
                </el-icon>
              </el-button>
            )}
          </div>
        </div>
      )
    }

    const renderContent = () => (
      <el-scrollbar
        class="fd-dialog__scrollbar"
        height={contentHeight.value}
      >
        {slots.default?.()}
      </el-scrollbar>
    )

    const dialogSlots = {
      ...slots,
      header: renderHeader,
      default: renderContent,
    }

    return () => (
      <ElDialog
        {...attrs}
        {...props}
        class={["fd-dialog", attrs.class]}
        fullscreen={isFullscreen.value}
        showClose={false}
        modelValue={visible.value}
        onOpen={() => emitEvent("open")}
        onOpened={() => emitEvent("opened")}
        onClose={() => emitEvent("close")}
        onClosed={() => emitEvent("closed")}
        onOpenAutoFocus={() => emitEvent("openAutoFocus")}
        onCloseAutoFocus={() => emitEvent("closeAutoFocus")}
        onUpdate:modelValue={onModelValueChange}
        v-slots={dialogSlots}
      />
    )
  },
})
