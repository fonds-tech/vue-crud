import type { FormInstance } from "element-plus"
import type { Component as VueComponent } from "vue"
import type { FormRef, FormItem, FormField, FormModel, FormOptions, FormComponent, FormUseOptions, FormRenderContent, FormRenderContext } from "../../types"
import { useFormActions } from "./helper/action"
import { useFormMethods } from "./helper/methods"
import { merge, cloneDeep } from "lodash-es"
import { normalizeItems, resolveMaybeFn } from "./helper/schema"
import { ElCol, ElRow, ElForm, ElStep, ElTabs, ElSteps, ElDivider, ElTabPane, ElFormItem } from "element-plus"
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

function resolveValue<T extends FormModel = FormModel, R = unknown>(source: R | ((ctx: FormRenderContext<T>) => R), ctx: FormRenderContext<T>) {
  return resolveMaybeFn(source, ctx)
}

function resolveContent<T>(content: FormRenderContent<T> | undefined, ctx: FormRenderContext<T>) {
  if (content === undefined || content === null)
    return null
  return typeof content === "function" ? content(ctx) : content
}

export default defineComponent({
  name: "fd-form",
  setup(_, { slots, expose }) {
    const formRef = ref<FormInstance>()
    const options = reactive<FormOptions>(createDefaultOptions())
    const model = reactive<LooseRecord>({})
    const step = ref(1)

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
    } = useFormActions({ options, model, form: formRef })

    const { submit, validate, validateField, resetFields, clearFields, clearValidate, scrollToField } = useFormMethods({ options, model, form: formRef })

    function createContext<T extends FormModel = FormModel>(field?: FormField<T>): FormRenderContext<T> {
      return {
        model: model as T,
        field,
      }
    }

    function mergeOptions<T extends FormModel = FormModel>(useOptions: FormUseOptions<T> = {}) {
      const merged = merge(createDefaultOptions(), useOptions)
      Object.assign(options, merged)
      options.model = model as T
      clearModel()
      if (useOptions.model) {
        Object.assign(model, cloneDeep(useOptions.model))
      }
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

    function renderComponent<T extends FormModel>(component: FormComponent<T> | undefined, ctx: FormRenderContext<T>) {
      if (component === undefined) {
        return null
      }
      const slotName = resolveValue(component.slot, ctx)
      const slotRender = typeof slotName === "string" && slotName.length > 0 ? slots[slotName] : undefined
      if (typeof slotRender === "function") {
        return slotRender({ model, field: ctx.field })
      }

      const rawTarget = component.is !== undefined ? resolveMaybeFn<FormRenderContext<T>, string | VueComponent>(component.is, ctx) : undefined
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
        <ElCol span={columnSpan} key={`${item.field ?? index}`} style={{ marginBottom: `${options.layout.grid.rowGap}px` }}>
          <ElFormItem prop={item.field as string} rules={disabled ? undefined : item.rules} required={required} extra={extra} label={label}>
            {{
              default: () => content,
            }}
          </ElFormItem>
          {item.collapse === true && (
            <div class="fd-form__collapse">
              <ElDivider>{item.collapse ? "..." : ""}</ElDivider>
            </div>
          )}
        </ElCol>
      )
    }

    function renderGroup() {
      const group = options.group
      if (!group || !Array.isArray(group.children) || group.children.length === 0) {
        return null
      }
      if (group.type === "steps") {
        return (
          <ElSteps active={step.value - 1} finish-status="success">
            {group.children.map((pane, index) => (
              <ElStep title={pane.title} key={index} />
            ))}
          </ElSteps>
        )
      }
      if (group.type === "tabs") {
        return (
          <ElTabs modelValue={group.children[0]?.title}>
            {group.children.map((pane, index) => (
              <ElTabPane label={pane.title} name={pane.title} key={index}>
                {pane.children?.map((component, idx) => renderGroupSlot(component, idx))}
              </ElTabPane>
            ))}
          </ElTabs>
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

    const context: FormRef = {
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
    }

    expose(context)

    onMounted(() => {
      if (options.items.length === 0) {
        normalizeItems(options.items, model)
      }
    })

    return () => (
      <div class="fd-form">
        {renderGroup()}
        <ElForm
          ref={formRef}
          class="fd-form__body"
          model={model}
          {...options.form}
          onSubmit={(event: Event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <ElRow gutter={options.layout.grid.colGap}>{options.items.map((item, index) => renderItem(item, index))}</ElRow>
        </ElForm>
      </div>
    )
  },
})
