<template>
  <el-dialog
    v-bind="dialogPropBindings"
    :class="dialogCssClass"
    :fullscreen="fullscreenActive"
    :show-close="false"
    :model-value="dialogVisible"
    @update:model-value="handleModelValueUpdate"
    @update:fullscreen="handleFullscreenUpdate"
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
          <div
            class="fd-dialog__action"
            role="button"
            :aria-label="fullscreenButtonLabel"
            :title="fullscreenButtonLabel"
            @click="handleToggleFullscreen"
          >
            <el-icon>
              <component :is="fullscreenButtonIcon" />
            </el-icon>
          </div>
          <div
            v-if="shouldRenderCloseAction"
            class="fd-dialog__action"
            role="button"
            aria-label="关闭弹窗"
            title="关闭弹窗"
            @click="handleCloseClick"
          >
            <el-icon>
              <component :is="closeIcon" />
            </el-icon>
          </div>
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
import IconTablerX from "~icons/tabler/x"
import IconTablerMaximize from "~icons/tabler/maximize"
import IconTablerMinimize from "~icons/tabler/minimize"
import { dialogProps } from "element-plus"
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

// 继承 Element Plus 的事件定义，并扩展 update:fullscreen 事件
const emit = defineEmits<{
  (event: "open"): void
  (event: "opened"): void
  (event: "close"): void
  (event: "closed"): void
  (event: "update:modelValue", value: boolean): void
  (event: "openAutoFocus"): void
  (event: "closeAutoFocus"): void
  (event: "update:fullscreen", value: boolean): void
}>()
const emitEvent = emit

const closeIcon = IconTablerX

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

function handleFullscreenUpdate(value: boolean) {
  fullscreenActive.value = value
  emitEvent("update:fullscreen", value)
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
const fullscreenButtonIcon = computed(() => (fullscreenActive.value ? IconTablerMinimize : IconTablerMaximize))
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

<style scoped lang="scss">
.fd-dialog {
  display: flex;
  flex-direction: column;

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 0;
    border-bottom: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  }

  &__header {
    gap: 12px;
    display: flex;
    align-items: center;
  }

  &__title {
    flex: 1;
    color: var(--el-text-color-primary, #303133);
    overflow: hidden;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__actions {
    display: inline-flex;
    align-items: center;
  }

  &__action {
    color: var(--el-text-color-secondary, #606266);
    width: 32px;
    cursor: pointer;
    height: 32px;
    display: flex;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;
    align-items: center;
    border-radius: 50%;
    justify-content: center;

    &:hover {
      color: var(--el-color-primary, #409eff);
      background-color: var(--el-color-primary-light-9, #ecf5ff);
    }
  }

  &__scrollbar {
    flex: 1;
    padding: 16px 24px;

    :deep(.el-scrollbar__wrap) {
      box-sizing: border-box;
      padding-right: 8px;
    }
  }
}
</style>
