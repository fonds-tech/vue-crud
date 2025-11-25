<template>
  <span class="fd-import">
    <el-button
      :class="triggerClass"
      v-bind="buttonBindings"
      :type="buttonType"
      :size="style.size"
      @click="handleTriggerClick"
    >
      <slot>{{ title }}</slot>
    </el-button>

    <input
      v-if="!hasTemplate"
      ref="uploadInputRef"
      class="fd-import__input"
      type="file"
      :accept="accept"
      @change="handleFileInputChange"
    >

    <fd-dialog v-if="hasTemplate" v-model="visible" :title="title" :width="dialogWidth">
      <el-form label-width="92px" class="fd-import__form">
        <el-form-item v-if="templateAvailable" label="导入模板">
          <el-link class="fd-import__template" type="primary" @click="downloadTemplate">
            <el-icon class="fd-import__template-icon">
              <component :is="downloadIcon" />
            </el-icon>
            <span>下载模板</span>
          </el-link>
        </el-form-item>

        <el-form-item label="上传文件" required>
          <el-upload
            ref="uploadRef"
            drag
            :accept="accept"
            :limit="limit"
            :show-file-list="false"
            :disabled="uploading || confirmLoading"
            :http-request="handleUpload"
            class="fd-import__upload"
          >
            <el-icon class="fd-import__upload-icon">
              <component :is="uploadIcon" />
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="fd-import__tip">
                {{ tipText }}
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="uploadResult" label="返回结果">
          <slot name="result" :data="uploadResult">
            <el-alert class="fd-import__result" type="success" :title="resultTitle" :closable="false" />
          </slot>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="uploading || confirmLoading" @click="handleCancel">取消</el-button>
        <el-button type="primary" :disabled="!uploadResult" :loading="confirmLoading" @click="handleConfirm">
          确认导入
        </el-button>
      </template>
    </fd-dialog>
  </span>
</template>

<script setup lang="ts">
import type { PropType } from "vue"
import type { UploadInstance, UploadProgressEvent, UploadRequestOptions } from "element-plus"
import FdDialog from "../fd-dialog/index.vue"
import { ElMessage } from "element-plus"
import { useCore, useConfig } from "@/hooks"
import { isString, isFunction } from "lodash-es"
import { Download, UploadFilled } from "@element-plus/icons-vue"
import { ref, watch, computed, nextTick, useAttrs, shallowRef, defineOptions } from "vue"

type UploadExecutor = (payload: FormData) => Promise<any>
type ConfirmExecutor = (payload: Record<string, any> | null) => Promise<any>
type TemplateResolver = string | (() => Promise<string | { url?: string } | undefined>)
type ButtonType = "" | "default" | "primary" | "success" | "warning" | "danger" | "info"
interface UploadAjaxError extends Error {
  status: number
  method: string
  url: string
}

defineOptions({
  name: "fd-import",
  inheritAttrs: false,
})

const props = defineProps({
  title: {
    type: String,
    default: "批量导入",
  },
  api: {
    type: String,
    default: "",
  },
  uploadApi: {
    type: String,
    default: "",
  },
  upload: {
    type: Function as PropType<UploadExecutor | undefined>,
    default: undefined,
  },
  confirmApi: {
    type: String,
    default: "",
  },
  confirm: {
    type: Function as PropType<ConfirmExecutor | undefined>,
    default: undefined,
  },
  template: {
    type: [String, Function] as PropType<TemplateResolver | undefined>,
    default: "",
  },
  accept: {
    type: String,
    default: ".xlsx,.xls,.csv",
  },
  limit: {
    type: Number,
    default: 1,
  },
  fileField: {
    type: String,
    default: "fileData",
  },
  tip: {
    type: String,
    default: "仅支持 .xlsx/.xls/.csv 文件，单次仅限上传 1 个文件。",
  },
  buttonType: {
    type: String as PropType<ButtonType>,
    default: "primary",
  },
  autoRefresh: {
    type: Boolean,
    default: true,
  },
  width: {
    type: [String, Number],
    default: 520,
  },
})

const attrs = useAttrs()
const { crud } = useCore()
const { style } = useConfig()

const visible = ref(false)
const uploading = ref(false)
const confirmLoading = ref(false)
const uploadResult = ref<Record<string, any> | null>(null)
const uploadRef = ref<UploadInstance>()
const uploadInputRef = ref<HTMLInputElement>()

const dialogWidth = computed(() => (typeof props.width === "number" ? `${props.width}px` : props.width))
const hasTemplate = computed(() => Boolean(props.template))
const templateAvailable = hasTemplate
const tipText = computed(() => props.tip)
const downloadIcon = shallowRef(Download)
const uploadIcon = shallowRef(UploadFilled)

const buttonBindings = computed<Record<string, any>>(() => {
  const result: Record<string, any> = {}
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "class") {
      return
    }
    result[key] = value
  })
  return result
})

const triggerClass = computed(() => {
  if (!attrs.class) {
    return "fd-import__trigger"
  }
  return ["fd-import__trigger", attrs.class]
})

const resultTitle = computed(() => {
  const value = uploadResult.value
  if (!value) {
    return ""
  }
  const textCandidates = ["message", "msg", "tips"]
  const text = textCandidates
    .map(key => value[key])
    .find(item => typeof item === "string" && item.length > 0)
  return text ?? "上传成功"
})

const uploadExecutor = computed<UploadExecutor | undefined>(() => {
  if (isFunction(props.upload)) {
    return props.upload
  }
  const apiName = props.api || props.uploadApi
  if (apiName && isFunction(crud.service?.[apiName])) {
    return (payload: FormData) => crud.service[apiName](payload)
  }
  return undefined
})

const confirmExecutor = computed<ConfirmExecutor | undefined>(() => {
  if (isFunction(props.confirm)) {
    return props.confirm
  }
  if (props.confirmApi && isFunction(crud.service?.[props.confirmApi])) {
    return (payload: Record<string, any> | null) => crud.service[props.confirmApi](payload)
  }
  return undefined
})

function handleTriggerClick() {
  if (hasTemplate.value) {
    visible.value = true
    return
  }
  triggerDirectUpload()
}

function resetState() {
  uploadResult.value = null
  uploadRef.value?.clearFiles?.()
}

function handleCancel() {
  visible.value = false
}

async function triggerDirectUpload() {
  await nextTick()
  uploadInputRef.value?.click()
}

function handleFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (file) {
    void handleDirectUpload(file)
  }
  if (target) {
    target.value = ""
  }
}

async function handleDirectUpload(file: File) {
  try {
    await performUpload(file)
    await runConfirmStep(uploadResult.value, { useLoading: false })
    resetState()
  }
  catch {
    // 错误已在内部处理
  }
}

watch(
  () => visible.value,
  (opened) => {
    if (!opened) {
      resetState()
    }
  },
)

async function handleUpload(option: UploadRequestOptions) {
  try {
    await performUpload(option.file as File, option)
  }
  catch {
    // 错误已在 performUpload 中提示
  }
}

async function performUpload(file: File, option?: UploadRequestOptions) {
  const executor = uploadExecutor.value
  if (!executor) {
    const error = new Error("请为 fd-import 提供 upload 函数或 uploadApi")
    option?.onError?.(normalizeUploadError(error))
    ElMessage.error(error.message)
    return
  }

  const formData = new FormData()
  formData.append(props.fileField, file)
  if (option?.data && typeof option.data === "object") {
    Object.entries(option.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob)
      }
    })
  }

  uploading.value = true
  option?.onProgress?.({ percent: 10 } as UploadProgressEvent)

  try {
    const response = await executor(formData)
    uploadResult.value = response?.data ?? response
    option?.onProgress?.({ percent: 100 } as UploadProgressEvent)
    option?.onSuccess?.(uploadResult.value)
    ElMessage.success("上传成功")
  }
  catch (error: any) {
    uploadResult.value = null
    option?.onError?.(normalizeUploadError(error))
    ElMessage.error(error?.message ?? "上传失败")
    throw error
  }
  finally {
    uploading.value = false
  }
}

async function handleConfirm() {
  if (!uploadResult.value) {
    ElMessage.warning("请先完成文件上传")
    return
  }

  try {
    await runConfirmStep(uploadResult.value, { useLoading: true })
    handleCancel()
  }
  catch {
    // runConfirmStep 内已提示
  }
}

async function downloadTemplate() {
  if (!props.template) {
    return
  }
  if (isString(props.template)) {
    window.open(props.template, "_blank")
    return
  }
  if (!isFunction(props.template)) {
    return
  }

  try {
    const result = await props.template()
    if (!result) {
      return
    }
    if (isString(result)) {
      window.open(result, "_blank")
    }
    else if (isString(result.url)) {
      window.open(result.url, "_blank")
    }
  }
  catch (error: any) {
    ElMessage.error(error?.message ?? "模板下载失败")
  }
}

async function runConfirmStep(payload: Record<string, any> | null, { useLoading }: { useLoading: boolean }) {
  const executor = confirmExecutor.value
  if (!executor) {
    ElMessage.success("导入成功")
    if (props.autoRefresh) {
      await crud.refresh()
    }
    return
  }

  if (useLoading) {
    confirmLoading.value = true
  }

  try {
    await executor(payload)
    ElMessage.success("导入成功")
    if (props.autoRefresh) {
      await crud.refresh()
    }
  }
  catch (error: any) {
    ElMessage.error(error?.message ?? "导入失败")
    throw error
  }
  finally {
    if (useLoading) {
      confirmLoading.value = false
    }
  }
}

function normalizeUploadError(error: any): UploadAjaxError {
  const baseMessage = typeof error?.message === "string" ? error.message : "上传失败"
  const uploadError = error instanceof Error ? error : new Error(baseMessage)
  const normalized = uploadError as UploadAjaxError
  if (typeof normalized.status !== "number") {
    normalized.status = typeof error?.status === "number" ? error.status : 0
  }
  if (typeof normalized.method !== "string") {
    normalized.method = typeof error?.method === "string" ? error.method : "post"
  }
  if (typeof normalized.url !== "string") {
    normalized.url = typeof error?.url === "string" ? error.url : ""
  }
  return normalized
}
</script>

<style scoped lang="scss">
.fd-import {
  display: inline-flex;
  align-items: center;
}

.fd-import__trigger {
  display: inline-flex;
  align-items: center;
}

.fd-import__input {
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  pointer-events: none;
}

.fd-import__form {
  padding: 8px 0 0;

  .el-form-item {
    margin-bottom: 16px;
  }
}

.fd-import__upload {
  width: 100%;
}

.fd-import__upload-icon {
  color: var(--el-color-primary);
  font-size: 32px;
  margin-bottom: 8px;
}

.fd-import__tip {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  line-height: 1.5;
}

.fd-import__result {
  width: 100%;
}

.fd-import__template {
  gap: 4px;
  display: inline-flex;
  align-items: center;
}

.fd-import__template-icon {
  font-size: 16px;
}
</style>
