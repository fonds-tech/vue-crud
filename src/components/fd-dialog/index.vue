<template>
  <el-dialog
    v-bind="dialogPropBindings"
    :class="dialogCssClass"
    :fullscreen="fullscreenActive"
    :show-close="false"
    :model-value="dialogVisible"
    @update:model-value="handleModelValueUpdate"
    @open="emitEvent('open')"
    @opened="emitEvent('opened')"
    @close="emitEvent('close')"
    @closed="emitEvent('closed')"
    @open-auto-focus="emitEvent('openAutoFocus')"
    @close-auto-focus="emitEvent('closeAutoFocus')"
  >
    <template #header>
      <div class="fd-dialog__header">
        <div class="fd-dialog__title">
          {{ props.title }}
        </div>
        <div class="fd-dialog__actions">
          <el-button
            class="fd-dialog__action"
            text
            circle
            :aria-label="fullscreenButtonLabel"
            :title="fullscreenButtonLabel"
            @click="handleToggleFullscreen"
          >
            <el-icon>
              <component :is="fullscreenButtonIcon" />
            </el-icon>
          </el-button>
          <el-button v-if="shouldRenderCloseAction" class="fd-dialog__action" text circle @click="handleCloseClick">
            <el-icon>
              <close />
            </el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <el-scrollbar class="fd-dialog__scrollbar" :height="scrollbarHeight">
      <slot />
    </el-scrollbar>

    <template #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { DialogEmits } from "element-plus/es/components/dialog/src/dialog"
import { dialogEmits, dialogProps } from "element-plus"
import { FullScreen, ScaleToOriginal } from "@element-plus/icons-vue"
import { ref, watch, computed, useAttrs } from "vue"

defineOptions({
  name: "fd-dialog",
  inheritAttrs: false,
})

const props = defineProps({
  ...dialogProps,
  height: {
    type: [Number, String],
    default: "60vh",
  },
})

// 继承 Element Plus 的事件定义，保证 emit 参数一致
type EmitFn = <T extends keyof DialogEmits>(name: T, ...args: Parameters<DialogEmits[T]>) => void
const emit = defineEmits(dialogEmits) as EmitFn
const emitEvent: EmitFn = (name, ...args) => emit(name, ...args)

const attrs = useAttrs()
const attrsRecord = attrs as Record<string, unknown> & { class?: unknown }

// 以 ref 管理可见性，兼容 v-model 及手动控制
const dialogVisible = ref(Boolean(props.modelValue))

function handleModelValueUpdate(value: boolean) {
  dialogVisible.value = value
  emitEvent("update:modelValue", value)
}

watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = Boolean(val)
  },
)

// 全屏态既响应 props 变更，也可通过内部逻辑切换
const fullscreenActive = ref(Boolean(props.fullscreen))

watch(
  () => props.fullscreen,
  (val) => {
    fullscreenActive.value = Boolean(val)
  },
)

function handleToggleFullscreen() {
  fullscreenActive.value = !fullscreenActive.value
}

function handleCloseClick() {
  dialogVisible.value = false
  emitEvent("update:modelValue", false)
}

const scrollbarHeight = computed(() => {
  const { height } = props
  if (height === undefined || height === null || height === "")
    return undefined
  return typeof height === "number" ? `${height}px` : height
})

const fullscreenButtonLabel = computed(() => (fullscreenActive.value ? "退出全屏" : "全屏"))
const fullscreenButtonIcon = computed(() => (fullscreenActive.value ? ScaleToOriginal : FullScreen))
const shouldRenderCloseAction = computed(() => props.showClose !== false)

const dialogCssClass = computed(() => {
  const extraClass = attrsRecord.class
  return extraClass ? ["fd-dialog", extraClass] : ["fd-dialog"]
})

// 仅剔除 class，其他 attrs 全部透传给 <el-dialog>
const dialogNativeAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  Object.keys(attrsRecord).forEach((key) => {
    if (key === "class")
      return
    result[key] = attrsRecord[key]
  })
  return result
})

// props 与 attrs 合并，确保调用者可直接传入原生 Dialog 的所有配置
const dialogPropBindings = computed(() => ({
  ...props,
  ...dialogNativeAttrs.value,
}))

function open() {
  dialogVisible.value = true
  emitEvent("update:modelValue", true)
}

function close() {
  dialogVisible.value = false
  emitEvent("update:modelValue", false)
}

function fullscreen(value?: boolean) {
  if (typeof value === "boolean") {
    fullscreenActive.value = value
    return
  }
  handleToggleFullscreen()
}

defineExpose({
  open,
  close,
  fullscreen,
  dialogVisible,
  fullscreenActive,
})
</script>
