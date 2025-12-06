import type { GridProps } from "../grid"
import type { dialogProps } from "element-plus"
import type { ExtractPropTypes } from "vue"
import type {
  FormRef,
  FormItem,
  FormGroup,
  FormRecord,
  DeepPartial,
  FormActions,
  FormMaybeFn,
  FormMethods,
  FormUseOptions,
  FormComponentSlot,
} from "../form/types"

type NativeDialogProps = Omit<ExtractPropTypes<typeof dialogProps>, "modelValue">

export type UpsertDialogProps = Partial<NativeDialogProps> & {
  /**
   * 内容区高度
   */
  height?: string | number
  /**
   * 加载提示文案
   */
  loadingText?: string
}

export type UpsertMode = "add" | "update"

export type UpsertCloseAction = "cancel" | "submit"

export interface UpsertAction<T extends FormRecord = FormRecord> {
  text?: FormMaybeFn<string, T>
  type?: "ok" | "cancel" | "next" | "prev"
  hidden?: FormMaybeFn<boolean, T>
  component?: FormComponentSlot<T>
}

export interface UpsertOptions<T extends FormRecord = FormRecord> {
  key: number
  mode: UpsertMode
  form: FormUseOptions<T>["form"]
  model: T
  items: Array<FormItem<T>>
  group: FormGroup<T>
  grid?: GridProps
  actions: Array<UpsertAction<T>>
  dialog: UpsertDialogProps
  onNext?: FormUseOptions<T>["onNext"]
  onOpen?: (model: T, ctx: UpsertLifecycleContext<T>) => void
  onBeforeOpen?: (model: T, ctx: UpsertLifecycleContext<T>) => void
  onClose?: (action: UpsertCloseAction, model: T, ctx: UpsertLifecycleContext<T>) => void
  onBeforeClose?: (action: UpsertCloseAction, model: T, ctx: UpsertLifecycleContext<T>) => void
  onDetail?: (row: Record<string, any>, ctx: UpsertDetailContext) => void
  onSubmit?: (payload: T, ctx: UpsertSubmitContext) => void
}

export type UpsertUseOptions<T extends FormRecord = FormRecord> = DeepPartial<UpsertOptions<T>> & Record<string, any>

export interface UpsertLifecycleContext<T extends FormRecord = FormRecord> {
  mode: UpsertMode
  close: (action?: UpsertCloseAction) => void
  form?: FormRef<T>
}

export interface UpsertDetailContext {
  mode: UpsertMode
  done: (data: Record<string, any>) => void
  next: (params: Record<string, any>) => Promise<any>
  close: (action?: UpsertCloseAction) => void
}

export interface UpsertSubmitContext {
  mode: UpsertMode
  done: () => void
  next: (payload: Record<string, any>) => Promise<any>
  close: (action?: UpsertCloseAction) => void
}

export interface UpsertExpose<T extends FormRecord = FormRecord> extends FormActions<T>, FormMethods<T> {
  mode: UpsertMode
  visible: boolean
  loading: boolean
  model: T
  form?: FormRef<T>
  use: (options: UpsertUseOptions<T>) => void
  add: (data?: Partial<T>) => Promise<void>
  update: (row?: Record<string, any>) => Promise<void>
  append: (row?: Record<string, any>) => Promise<void>
  close: (action?: UpsertCloseAction) => void
  submit: (extra?: Record<string, any>) => Promise<any>
}

export type UpsertRef<T extends FormRecord = FormRecord> = UpsertExpose<T>

export type { FormComponent as UpsertComponent, FormComponentSlot as UpsertComponentSlot, FormGroup as UpsertGroup, FormItem as UpsertItem } from "../form/types"
