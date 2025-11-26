<template>
  <fd-dialog v-bind="dialogBindings" v-model="visible" :class="dialogClass" @open="handleOpen" @close="handleClose">
    <el-skeleton v-if="loading" :loading="loading" animated :rows="4" class="fd-upsert__skeleton">
      <template #template>
        <div class="fd-upsert__skeleton-row"></div>
      </template>
      <template #default>
        <p class="fd-upsert__loading-text">
          {{ options.dialog.loadingText }}
        </p>
      </template>
    </el-skeleton>
    <fd-form v-else ref="formRef">
      <template v-for="(_, name) in userSlots" :key="name" #[name]="slotScope">
        <slot :name="name" v-bind="createSlotProps(slotScope)" />
      </template>
    </fd-form>

    <template #footer>
      <div class="fd-upsert__footer">
        <template v-for="(action, index) in options.actions" :key="index">
          <template v-if="isActionVisible(action)">
            <el-button v-if="action.type === 'cancel'" @click="close('cancel')">
              {{ resolveActionText(action) }}
            </el-button>
            <el-button v-else-if="action.type === 'next'" type="primary" @click="handleNext">
              {{ resolveActionText(action) }}
            </el-button>
            <el-button v-else-if="action.type === 'prev'" type="primary" @click="handlePrev">
              {{ resolveActionText(action) }}
            </el-button>
            <el-button v-else-if="action.type === 'ok'" type="primary" :loading="loading" @click="submit()">
              {{ resolveActionText(action) }}
            </el-button>
            <slot v-else-if="slotNameOf(action.component)" :name="slotNameOf(action.component)!" :index="index" :mode="mode" :model="formModel" />
            <component
              :is="componentOf(action.component)"
              v-else-if="componentOf(action.component)"
              v-bind="componentProps(action.component)"
              :style="componentStyle(action.component)"
              v-on="componentEvents(action.component)"
            >
              <template v-for="(value, childSlot) in componentSlots(action.component)" :key="childSlot" #[childSlot]>
                <component :is="value" />
              </template>
            </component>
          </template>
        </template>
      </div>
    </template>
  </fd-dialog>
</template>

<script setup lang="ts">
import type { FormRef, FormRecord, FormUseOptions } from "../fd-form/type"
import type { UpsertMode, UpsertOptions, UpsertUseOptions, UpsertCloseAction } from "./type"
import FdForm from "../fd-form/index.vue"
import FdDialog from "../fd-dialog/index.vue"
import { merge } from "lodash-es"
import { useUpsertActions } from "./helper/actions"
import { clone, isFunction } from "@fonds/utils"
import { useCore, useConfig } from "../../hooks"
import { useComponentHelper } from "./helper/component"
import { ElButton, ElMessage, ElSkeleton } from "element-plus"
import { ref, watch, computed, nextTick, reactive, useAttrs, useSlots, onBeforeUnmount } from "vue"

defineOptions({
  name: "fd-upsert",
  inheritAttrs: false,
})

const emit = defineEmits(["open", "close", "beforeOpen", "beforeClose"])

const { crud, mitt } = useCore()
const { style } = useConfig()
const attrs = useAttrs() as Record<string, unknown> & { class?: unknown }
const userSlots = useSlots()
const formRef = ref<FormRef>()
const visible = ref(false)
const loading = ref(false)
const mode = ref<UpsertMode>("add")
const closeAction = ref<UpsertCloseAction>("cancel")

const options = reactive<UpsertOptions>({
  key: 0,
  mode: "add",
  form: {
    labelWidth: style.form?.labelWidth,
    labelPosition: style.form?.labelPosition,
  },
  model: {} as FormRecord,
  items: [],
  group: {},
  grid: {
    cols: 24,
    rowGap: 16,
    colGap: 16,
  },
  actions: [],
  dialog: {
    width: "60%",
    showClose: true,
    destroyOnClose: false,
    loadingText: "加载中，请稍等...",
  },
})

const dialogNativeAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  Object.keys(attrs).forEach((key) => {
    if (key === "class")
      return
    result[key] = attrs[key]
  })
  return result
})

const defaultTitle = computed(() => (mode.value === "add" ? crud.dict?.label?.add ?? "新增" : crud.dict?.label?.update ?? "编辑"))

const dialogClass = computed(() => {
  const extra = attrs.class
  return extra ? ["fd-upsert", extra] : ["fd-upsert"]
})

const dialogBindings = computed(() => {
  const { loadingText, ...rest } = options.dialog
  return {
    ...rest,
    title: rest.title ?? defaultTitle.value,
    ...dialogNativeAttrs.value,
  }
})

const formModel = computed(() => formRef.value?.model ?? {})

const { createSlotProps, slotNameOf, componentOf, componentProps, componentStyle, componentEvents, componentSlots } = useComponentHelper({
  mode,
  formModel,
  loading,
})

const { ensureActions, resolveActionText, isActionVisible } = useUpsertActions({
  options,
  crud,
  formModel,
  mode,
})

ensureActions()

watch(
  () => visible.value,
  (current, previous) => {
    if (current && !previous) {
      handleBeforeOpen()
    }
    else if (!current && previous) {
      handleBeforeClose()
    }
  },
)

function useUpsert(useOptions: UpsertUseOptions = {}) {
  const normalized = clone(useOptions)
  const { items, actions, model: modelOverrides, ...rest } = normalized
  merge(options, rest)

  if (Array.isArray(actions)) {
    options.actions.splice(0, options.actions.length, ...actions)
  }

  if (Array.isArray(items)) {
    options.items.splice(0, options.items.length, ...items.filter(Boolean))
  }

  if (modelOverrides) {
    Object.keys(options.model).forEach((key) => {
      delete options.model[key]
    })
    Object.assign(options.model, modelOverrides)
  }

  ensureActions()
}

function buildFormOptions(initialData: Record<string, any> = {}): FormUseOptions {
  const key = Date.now()
  options.key = key
  options.mode = mode.value
  const baseModel = clone(options.model ?? {})
  const values = merge(baseModel, clone(initialData))
  return {
    key,
    mode: mode.value,
    form: options.form,
    group: options.group,
    items: options.items,
    model: values,
    grid: options.grid,
    onNext: options.onNext,
  }
}

async function applyForm(initialData: Record<string, any> = {}) {
  await nextTick()
  const formOptions = buildFormOptions(initialData)
  formRef.value?.use(formOptions)
  formRef.value?.setMode?.(mode.value)
  formRef.value?.bindFields(formOptions.model ?? {})
}

async function open(initialData: Record<string, any> = {}) {
  closeAction.value = "cancel"
  visible.value = true
  await applyForm(initialData)
}

async function add(data: Record<string, any> = {}) {
  mode.value = "add"
  loading.value = false
  await open(data)
}

async function append(data: Record<string, any> = {}) {
  mode.value = "add"
  loading.value = false
  await open(data)
}

function getDetailApiName() {
  return crud.dict?.api?.detail ?? crud.dict?.api?.info ?? "detail"
}

function requestDetail(query: Record<string, any>, done: (value: Record<string, any>) => void) {
  const apiName = getDetailApiName()
  const service = crud.service?.[apiName]
  if (!isFunction(service)) {
    const error = new Error(`未在 CRUD service 中找到 ${apiName} 方法`)
    ElMessage.error(error.message)
    loading.value = false
    return Promise.reject(error)
  }
  return service(query)
    .then((res: Record<string, any>) => {
      done(res ?? {})
      return res
    })
    .catch((err: any) => {
      ElMessage.error(err?.message ?? "详情查询失败")
      throw err
    })
    .finally(() => {
      loading.value = false
    })
}

async function update(row: Record<string, any> = {}) {
  mode.value = "update"
  loading.value = true
  await open()
  const done = async (value: Record<string, any> = {}) => {
    loading.value = false
    await applyForm(value)
  }
  const next = (query: Record<string, any>) => requestDetail(query, done)
  if (isFunction(options.onDetail)) {
    return options.onDetail(row, { mode: mode.value, done, next, close })
  }
  const primaryKey = crud.dict?.primaryId ?? "id"
  if (row?.[primaryKey] === undefined) {
    const error = new Error(`缺少主键字段 ${primaryKey}`)
    ElMessage.error(error.message)
    loading.value = false
    return Promise.reject(error)
  }
  return next({ [primaryKey]: row[primaryKey] })
}

function close(action: UpsertCloseAction = "cancel") {
  closeAction.value = action
  visible.value = false
}

function handleNext() {
  formRef.value?.next?.()
}

function handlePrev() {
  formRef.value?.prev?.()
}

function handleBeforeOpen() {
  const snapshot = clone(formModel.value)
  emit("beforeOpen", { mode: mode.value, model: snapshot })
  options.onBeforeOpen?.(snapshot, { mode: mode.value, close, form: formRef.value })
}

function handleBeforeClose() {
  const snapshot = clone(formModel.value)
  emit("beforeClose", { action: closeAction.value, mode: mode.value, model: snapshot })
  options.onBeforeClose?.(closeAction.value, snapshot, { mode: mode.value, close, form: formRef.value })
}

function handleOpen() {
  const snapshot = clone(formModel.value)
  emit("open", { mode: mode.value, model: snapshot })
  options.onOpen?.(snapshot, { mode: mode.value, close, form: formRef.value })
}

function handleClose() {
  const snapshot = clone(formModel.value)
  emit("close", { action: closeAction.value, mode: mode.value, model: snapshot })
  options.onClose?.(closeAction.value, snapshot, { mode: mode.value, close, form: formRef.value })
  if (closeAction.value === "cancel") {
    loading.value = false
  }
}

function handleProxyEvent(payload: unknown) {
  if (!payload || typeof payload !== "object")
    return
  const proxyPayload = payload as { name?: string, data?: Record<string, any>[] }
  switch (proxyPayload.name) {
    case "add":
      add(proxyPayload.data?.[0] ?? {})
      break
    case "append":
      append(proxyPayload.data?.[0] ?? {})
      break
    case "edit":
      update(proxyPayload.data?.[0] ?? {})
      break
    case "close":
      close("cancel")
      break
    default:
      break
  }
}

mitt?.on?.("crud.proxy", handleProxyEvent)

onBeforeUnmount(() => {
  mitt?.off?.("crud.proxy", handleProxyEvent)
})

async function submit(extra: Record<string, any> = {}) {
  if (!formRef.value)
    return Promise.reject(new Error("表单未初始化"))
  loading.value = true
  const result = await formRef.value.submit()
  const values = result?.values ?? {}
  const errors = result?.errors
  if (errors && Object.keys(errors).length) {
    loading.value = false
    return Promise.reject(errors)
  }
  const payload = merge(clone(values), clone(extra))
  const done = () => {
    loading.value = false
    close("submit")
    crud.refresh?.()
    ElMessage.success(crud.dict?.label?.saveSuccess ?? "保存成功")
  }
  const next = (data: Record<string, any>) => {
    const apiName = mode.value === "add" ? crud.dict?.api?.add ?? "add" : crud.dict?.api?.update ?? "update"
    const service = crud.service?.[apiName]
    if (!isFunction(service)) {
      const error = new Error(`未在 CRUD service 中找到 ${apiName} 方法`)
      ElMessage.error(error.message)
      loading.value = false
      return Promise.reject(error)
    }
    return service(data)
      .then((res: any) => {
        done()
        return res
      })
      .catch((err: any) => {
        ElMessage.error(err?.message ?? "提交失败")
        loading.value = false
        throw err
      })
  }
  if (isFunction(options.onSubmit)) {
    const response = options.onSubmit(payload as FormRecord, { mode: mode.value, done, next, close })
    return Promise.resolve(response)
  }
  return next(payload)
}

defineExpose({
  get form() {
    return formRef.value
  },
  get model() {
    return formModel.value
  },
  mode,
  visible,
  loading,
  use: useUpsert,
  add,
  append,
  update,
  close,
  submit,
  next: handleNext,
  prev: handlePrev,
  bindFields: (data?: Record<string, any>) => formRef.value?.bindFields(data ?? {}),
  setField: (field: string, value: any) => formRef.value?.setField(field, value),
  getField: (field?: string) => formRef.value?.getField(field),
  setItem: (field: string, data: Record<string, any>) => formRef.value?.setItem(field, data),
  setOptions: (field: string, value: any[]) => formRef.value?.setOptions(field, value),
  getOptions: (field: string) => formRef.value?.getOptions(field),
  setProps: (field: string, value: Record<string, any>) => formRef.value?.setProps(field, value),
  setStyle: (field: string, value: Record<string, any>) => formRef.value?.setStyle(field, value),
  hideItem: (field: string | string[]) => formRef.value?.hideItem(field as any),
  showItem: (field: string | string[]) => formRef.value?.showItem(field as any),
  collapse: () => formRef.value?.collapse(),
  validate: (callback?: any) => formRef.value?.validate(callback),
  validateField: (field: any, callback?: any) => formRef.value?.validateField(field, callback),
  resetFields: (field?: any) => formRef.value?.resetFields(field),
  clearFields: (field?: any) => formRef.value?.clearFields(field),
  clearValidate: (field?: any) => formRef.value?.clearValidate(field),
  setFields: (data: Record<string, any>) => formRef.value?.setFields(data),
  scrollToField: (field: any) => formRef.value?.scrollToField(field),
})
</script>

<style scoped lang="scss">
.fd-upsert {
  &__footer {
    gap: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__skeleton {
    width: 100%;
    padding: 12px 4px;

    &-row {
      width: 100%;
      height: 16px;
      border-radius: 4px;
      margin-bottom: 12px;
      background-color: var(--el-color-info-light-9, #f4f4f5);
    }
  }

  &__loading-text {
    color: var(--el-color-info, #909399);
    margin: 0;
    padding: 4px 0;
    font-size: 14px;
    text-align: center;
  }
}
</style>
