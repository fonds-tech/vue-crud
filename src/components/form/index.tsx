import type { FormActions } from "./helper/action"
import type { FormMethods } from "./helper/methods"
import type { FormInstance } from "element-plus"
import type { Component as VueComponent } from "vue"
import type { FormRef, FormItem, FormField, FormModel, FormRecord, FormOptions, FormComponent, FormUseOptions, FormRenderContent, FormRenderContext } from "../../types"
import { useFormActions } from "./helper/action"
import { useFormMethods } from "./helper/methods"
import { merge, cloneDeep } from "lodash-es"
import { normalizeItems, resolveMaybeFn } from "./helper/schema"
import { h, ref, reactive, onMounted, defineComponent, getCurrentInstance, resolveComponent as resolveVueComponent } from "vue"

type LooseRecord = Record<string, any>

function createDefaultOptions(): FormOptions {
  return {
    key: 0,
    mode: "add",
    form: { labelWidth: 120, scrollToError: true },
    layout: {
      grid: {
        cols: { xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 },
        rowGap: 16,
        colGap: 16,
        collapsed: false,
        collapsedRows: 3,
      },
      column: { span: 1 },
    },
    group: undefined,
    items: [],
    model: {} as FormModel,
  }
}

function resolveValue<R = unknown>(source: R | ((ctx: FormRenderContext) => R), ctx: FormRenderContext) {
  return resolveMaybeFn(source, ctx)
}

function resolveContent(content: FormRenderContent | undefined, ctx: FormRenderContext) {
  if (content === undefined || content === null)
    return null
  return typeof content === "function" ? content(ctx) : content
}

export default defineComponent({
  name: "fd-form",
  setup(_, { slots, expose }) {
    const formRef = ref<FormInstance>()
    const options = reactive(createDefaultOptions())
    const model = reactive<LooseRecord>({})
    const step = ref(1)

    const resolveFormActions = useFormActions as unknown as (context: any) => FormActions
    const formActions = resolveFormActions({ options, model, form: formRef })
    const {
      clearModel,
      setMode,
      getField,
      setField,
      bindFields,
      setData,
      setItem,
      setOptions: setOptionsValue,
      getOptions: getOptionsValue,
      setProps,
      setStyle,
      hideItem,
      showItem,
      collapse,
      setRequired,
    } = formActions
    const resolveFormMethods = useFormMethods as unknown as (context: any) => FormMethods
    const formMethods = resolveFormMethods({ options, model, form: formRef })
    const { submit, validate, validateField, resetFields, clearFields, clearValidate, scrollToField } = formMethods

    function createContext(field?: FormField): FormRenderContext {
      return {
        model: model as FormRecord,
        field,
      }
    }

    function mergeOptions(useOptions: FormUseOptions = {}) {
      const merged = merge(createDefaultOptions(), useOptions) as FormOptions
      Object.assign(options, merged)
      options.model = model as FormRecord
      clearModel()
      const nextModel = useOptions.model as FormRecord | undefined
      if (nextModel !== undefined && nextModel !== null) {
        Object.assign(model, cloneDeep(nextModel))
      }
      // @ts-expect-error Type instantiation becomes too deep for TS 5.6, runtime behavior与原实现一致
      normalizeItems(options.items, model)
      step.value = 1
    }

    function use(useOptions: FormUseOptions = {}) {
      mergeOptions(useOptions)
    }

    function resolveTarget(target?: string | VueComponent | null) {
      if (target === undefined || target === null) {
        return null
      }
      if (typeof target === "string") {
        const pascal = target
          .split("-")
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join("")
        const resolvedTarget = resolveVueComponent(target) ?? resolveVueComponent(pascal)
        return resolvedTarget ?? pascal
      }
      return target ?? null
    }

    function renderComponent(component: FormComponent | undefined, ctx: FormRenderContext) {
      if (component === undefined) {
        return null
      }
      const slotName = resolveValue(component.slot, ctx)
      const slotRender = typeof slotName === "string" && slotName.length > 0 ? slots[slotName] : undefined
      if (typeof slotRender === "function") {
        return slotRender({ model, field: ctx.field })
      }

      const rawTarget = component.is !== undefined ? resolveMaybeFn<FormRenderContext, string | VueComponent>(component.is, ctx) : undefined
      const target = resolveTarget(rawTarget)
      if (target === null) {
        return null
      }

      type ComponentProps = Record<string, unknown> & {
        modelValue?: unknown
        options?: unknown
        ["onUpdate:modelValue"]?: (val: unknown) => void
      }
      const resolvedProps = resolveValue(component.props, ctx)
      const props: ComponentProps = resolvedProps ? { ...(resolvedProps as Record<string, unknown>) } : {}
      const resolvedEvents = resolveValue(component.on, ctx)
      const events: Record<string, (...args: unknown[]) => void> = resolvedEvents ? { ...(resolvedEvents as Record<string, (...args: unknown[]) => void>) } : {}
      const style = resolveValue(component.style, ctx)
      const slotMap = resolveValue(component.slots, ctx)

      if (ctx.field !== undefined) {
        const key = String(ctx.field)
        props.modelValue = model[key]
        props["onUpdate:modelValue"] = (val: unknown) => {
          model[key] = val
        }
      }

      if (component.options !== undefined && props.options === undefined) {
        props.options = resolveValue(component.options, ctx)
      }

      const children = slotMap ? Object.fromEntries(Object.entries(slotMap).map(([name, content]) => [name, () => resolveContent(content, ctx)])) : undefined

      return h(target, { ...props, ...events, style }, children)
    }

    function renderItem(item: FormItem, index: number) {
      const ctx = createContext(item.field)
      const hidden = Boolean(resolveValue(item.hidden, ctx))
      const disabled = Boolean(resolveValue(item.disabled, ctx))
      const required = Boolean(resolveValue(item.required, ctx))
      const label = resolveContent(item.label, ctx) ?? item.label
      const extra = resolveContent(item.extra, ctx)
      const baseCols = options.layout.grid.cols.lg ?? 2
      const unitSpan = Math.floor(24 / baseCols)
      const columnSpan = (item.span ?? options.layout.column.span ?? 1) * unitSpan
      const collapsedRows = options.layout.grid.collapsedRows ?? 3
      const collapsedLimit = collapsedRows * baseCols
      const collapsedHidden = options.layout.grid.collapsed === true && index >= collapsedLimit
      const shouldRender = !hidden && !collapsedHidden
      if (!shouldRender) {
        return null
      }

      const hasChildren = Array.isArray(item.children) && item.children.length > 0
      const content = hasChildren ? item.children!.map((child, childIndex) => renderItem(child, childIndex)) : renderComponent(item.component, ctx)

      return (
        <el-col span={columnSpan} key={`${item.field ?? index}`} style={{ marginBottom: `${options.layout.grid.rowGap}px` }}>
          <el-form-item prop={item.field as string} rules={disabled ? undefined : item.rules} required={required} extra={extra} label={label}>
            {{
              default: () => content,
            }}
          </el-form-item>
          {item.collapse === true && (
            <div class="fd-form__collapse">
              <el-divider>{item.collapse ? "..." : ""}</el-divider>
            </div>
          )}
        </el-col>
      )
    }

    function renderGroup() {
      const group = options.group
      if (!group || !Array.isArray(group.children) || group.children.length === 0) {
        return null
      }
      if (group.type === "steps") {
        return (
          <el-steps active={step.value - 1} finish-status="success">
            {group.children.map((pane, index) => (
              <el-step title={pane.title} key={index} />
            ))}
          </el-steps>
        )
      }
      if (group.type === "tabs") {
        return (
          <el-tabs modelValue={group.children[0]?.title}>
            {group.children.map((pane, index) => (
              <el-tab-pane label={pane.title} name={pane.title} key={index}>
                {pane.children?.map((component, idx) => renderGroupSlot(component, idx))}
              </el-tab-pane>
            ))}
          </el-tabs>
        )
      }
      return null
    }

    function renderGroupSlot(component: FormComponent | undefined, index: number) {
      const ctx = createContext()
      return (
        <div class="fd-form__group-slot" key={index}>
          {renderComponent(component, ctx)}
        </div>
      )
    }

    async function handleSubmit(callback?: (model: FormModel, errors?: Record<string, any>) => void) {
      await submit(callback)
    }

    function next() {
      const size = options.group?.children?.length ?? 0
      if (size > 0 && step.value < size) {
        step.value++
      }
      else {
        void submit()
      }
    }

    function prev() {
      if (step.value > 1) {
        step.value--
      }
    }

    const id = getCurrentInstance()?.uid

    const context = {
      id,
      get form() {
        return formRef.value
      },
      get model() {
        return model as FormModel
      },
      get items() {
        return options.items
      },
      get mode() {
        return options.mode
      },
      use,
      next,
      prev,
      setMode,
      getField,
      setField,
      bindFields,
      setData,
      setItem,
      setProps,
      setStyle,
      setOptions: setOptionsValue,
      getOptions: getOptionsValue,
      hideItem,
      showItem,
      collapse,
      setRequired,
      submit,
      validate,
      validateField,
      resetFields,
      clearFields,
      clearValidate,
      scrollToField,
    } as unknown as FormRef

    expose(context)

    onMounted(() => {
      if (options.items.length === 0) {
        normalizeItems(options.items, model)
      }
    })

    return () => {
      const items = options.items as unknown as FormItem[]
      return (
        <div class="fd-form">
          {renderGroup()}
          <el-form
            ref={formRef}
            model={model}
            {...options.form}
            onSubmit={(event: Event) => {
              event.preventDefault()
              void handleSubmit()
            }}
          >
            <el-row gutter={options.layout.grid.colGap}>{items.map((item, index) => renderItem(item, index))}</el-row>
          </el-form>
        </div>
      )
    }
  },
})
