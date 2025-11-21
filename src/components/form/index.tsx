import type {
  FormItem,
  FormField,
  FormModel,
  FormExpose,
  FormPlugin,
  FormOptions,
  FormCloseAction,
  FormRenderContent,
} from "../../types"
import formHook from "../../utils/formHook"
import { getValue, mergeObject } from "../../utils/object"
import { h, nextTick, defineComponent } from "vue"
import { keys, cloneDeep, isBoolean, isFunction } from "lodash-es"
import { useRefs, useElApi, useConfig, useBrowser } from "../../hooks"
import { useTabs, useAction, usePlugins, useFormState } from "./helper"
import { ElCol, ElRow, ElForm, ElTabs, ElButton, ElDivider, ElTabPane, ElFormItem } from "element-plus"

/* 由于动态表单渲染过程中不可避免地需要处理任意 schema/slot 数据，这里统一禁用一批针对 any/unknown 的规则以确保可维护性 */
/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-argument, ts/no-unsafe-call, ts/no-unsafe-member-access, ts/no-unsafe-return, ts/no-floating-promises, ts/strict-boolean-expressions */

type InternalItem<T extends FormModel = FormModel> = FormItem<T> & { _hidden?: boolean, _originField?: string }

interface RenderContext<T extends FormModel = FormModel> {
  model: T
  item?: InternalItem<T>
  field?: FormField<T>
}

export default defineComponent({
  name: "fd-form",
  props: {
    name: String,
    inner: Boolean,
    inline: Boolean,
    enablePlugin: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { expose, slots }) {
    const { refs, setRefs } = useRefs()
    const { style, dict } = useConfig()
    const browser = useBrowser()
    const { Form, config, form, visible, saving, loading, disabled } = useFormState()

    type LooseRecord = Record<string, unknown>

    const hasOwn = (target: LooseRecord, key: string) => Object.prototype.hasOwnProperty.call(target, key)
    const isLooseRecord = (value: unknown): value is LooseRecord => typeof value === "object" && value !== null

    const toRecord = <T extends Record<string, any>>(source: T): LooseRecord => source as unknown as LooseRecord

    function getFieldKey(field?: FormField<FormModel> | null | undefined) {
      if (field === undefined || field === null) {
        return null
      }
      const key = String(field)
      return key.length > 0 ? key : null
    }

    function getValueBySegments(source: LooseRecord, segments: string[]) {
      if (!segments.length) {
        return undefined
      }

      let cursor: unknown = source
      for (const segment of segments) {
        if (typeof segment !== "string" || segment.length === 0) {
          return undefined
        }
        if (!isLooseRecord(cursor)) {
          return undefined
        }
        cursor = cursor[segment]
        if (cursor === undefined) {
          return undefined
        }
      }
      return cursor
    }

    function resolveProvidedValue(data: FormModel | undefined, item: InternalItem<FormModel>) {
      const record = data ? toRecord(data) : null
      if (!record) {
        return undefined
      }

      const finalField = getFieldKey(item.field)
      const originalField = item._originField || finalField

      if (finalField && hasOwn(record, finalField)) {
        return record[finalField]
      }

      if (originalField && hasOwn(record, originalField)) {
        return record[originalField]
      }

      if (originalField && originalField.includes(".")) {
        const value = getValueBySegments(record, originalField.split(".").filter(Boolean))
        if (value !== undefined) {
          return value
        }
      }

      if (finalField && originalField && finalField !== originalField && finalField.includes("-")) {
        const value = getValueBySegments(record, finalField.split("-").filter(Boolean))
        if (value !== undefined) {
          return value
        }
      }

      return undefined
    }

    function getFormRecord() {
      return toRecord(form)
    }

    let closeAction: FormCloseAction = "close"
    let defForm: FormModel | undefined

    const Tabs = useTabs({ config, Form })
    const Action = useAction({ config, form, Form })
    const plugin = usePlugins(props.enablePlugin, { visible })

    const elFormApi = useElApi(
      [
        "validate",
        "validateField",
        "resetFields",
        "scrollToField",
        "clearValidate",
      ],
      Form,
    )

    function showLoading() {
      loading.value = true
    }

    function hideLoading() {
      loading.value = false
    }

    function setDisabled(flag = true) {
      disabled.value = flag
    }

    function done() {
      saving.value = false
    }

    function beforeClose(cb: () => void) {
      if (config.on?.close) {
        config.on.close(closeAction, cb)
      }
      else {
        cb()
      }
    }

    function close(action?: FormCloseAction) {
      if (action) {
        closeAction = action
      }
      beforeClose(() => {
        visible.value = false
        done()
      })
    }

    function onClosed() {
      Tabs.clear()
      Form.value?.clearValidate()
    }

    function clear() {
      const record = getFormRecord()
      Object.keys(record).forEach((key) => {
        delete record[key]
      })
      nextTick(() => {
        Form.value?.clearValidate()
      })
    }

    function reset() {
      if (!defForm) {
        return
      }
      const source = toRecord(defForm)
      const target = getFormRecord()
      Object.keys(target).forEach((key) => {
        delete target[key]
      })
      Object.entries(source).forEach(([key, value]) => {
        target[key] = cloneDeep(value)
      })
    }

    function ensureChildRecord(target: LooseRecord, key: string) {
      const current = target[key]
      if (isLooseRecord(current)) {
        return current
      }
      const next: LooseRecord = {}
      target[key] = next
      return next
    }

    function invokeData(data: Record<string, any>) {
      const record = toRecord(data)
      Object.keys(record).forEach((key) => {
        if (!key.includes("-")) {
          return
        }
        const [root, ...rest] = key.split("-")
        if (!root) {
          return
        }
        const leaf = rest.pop()
        if (!leaf) {
          return
        }
        const rootRecord = ensureChildRecord(record, root)
        let cursor = rootRecord
        rest.filter(Boolean).forEach((segment) => {
          cursor = ensureChildRecord(cursor, segment)
        })
        cursor[leaf] = record[key]
        delete record[key]
      })
    }

    function submit(callback?: (data: FormModel, helpers: { close: (action?: FormCloseAction) => void, done: () => void }) => void) {
      Form.value?.validate(async (valid, errors) => {
        if (valid) {
          saving.value = true
          const data = cloneDeep(form)

          config.items.forEach((item) => {
            const deep = (target: InternalItem<FormModel>) => {
              if (target.field) {
                if (target._hidden) {
                  delete data[target.field]
                }

                if (target.hook) {
                  formHook.submit({
                    hook: target.hook,
                    model: data,
                    field: target.field,
                    value: target.field ? data[target.field] : undefined,
                  })
                }
              }

              target.children?.forEach(deep)
            }
            deep(item as InternalItem<FormModel>)
          })

          invokeData(data)

          try {
            const payload = await plugin.submit(data)
            const handler = callback || config.on?.submit
            if (handler) {
              handler(payload, {
                close(action: FormCloseAction = "save") {
                  close(action)
                },
                done,
              })
            }
            else {
              done()
            }
          }
          catch {
            done()
          }
        }
        else {
          const errorField = keys(errors)[0]
          Tabs.toGroup({ prop: errorField })
        }
      })
    }

    function applyItems(items: FormItem[]) {
      const deep = (list: FormItem[]): FormItem[] => {
        return list.map((item) => {
          const value = getValue(item, { model: form })
          return {
            ...value,
            children: value.children ? deep(value.children) : undefined,
          }
        })
      }

      config.items = deep(items)
    }

    function open(options?: FormOptions<FormModel>, plugins?: FormPlugin[]) {
      if (!options) {
        return
      }

      if (options.isReset !== false) {
        clear()
      }

      visible.value = true
      closeAction = "close"

      for (const key of Object.keys(options) as Array<keyof FormOptions>) {
        const value = options[key]
        if (value === undefined) {
          continue
        }

        switch (key) {
          case "items":
            applyItems(value as FormItem[])
            break
          case "on":
          case "op":
          case "props":
          case "dialog":
          case "_data":
            mergeObject(config[key] as Record<string, any>, value as Record<string, any>)
            break
          default:
            // @ts-expect-error 动态赋值
            config[key] = value
            break
        }
      }

      config.items.forEach((item) => {
        const deep = (target: InternalItem<FormModel>) => {
          if (target.field) {
            if (!target._originField) {
              target._originField = String(target.field)
            }

            const originalField = target._originField

            if (target.field === originalField && originalField && originalField.includes(".")) {
              target.field = originalField.replace(/\./g, "-")
            }

            Tabs.mergeProp(target)

            const currentField = target.field ? String(target.field) : undefined

            if (currentField && options.form) {
              const provided = resolveProvidedValue(options.form, target)
              if (provided !== undefined) {
                form[currentField] = cloneDeep(provided)
              }
            }

            if (currentField && target.value !== undefined && form[currentField] === undefined) {
              form[currentField] = cloneDeep(target.value)
            }

            if (target.hook) {
              formHook.bind({
                hook: target.hook,
                model: form,
                field: target.field,
                value: currentField ? form[currentField] ?? cloneDeep(target.value) : undefined,
              })
            }

            if (target.required && !target.rules) {
              target.rules = [{
                required: true,
                message: (dict.label.nonEmpty || "{label}不能为空").replace("{label}", target.label || ""),
              }]
            }
          }

          if (target.type === "tabs") {
            Tabs.set(target.value as string)
          }

          target.children?.forEach(deep)
        }

        deep(item as InternalItem<FormModel>)
      })

      if (!defForm) {
        defForm = cloneDeep(form)
      }

      plugin.create(plugins || [])

      nextTick(() => {
        config.on?.open?.(form)
      })
    }

    function bindForm(data: Record<string, any>) {
      config.items.forEach((item) => {
        const deep = (target: InternalItem<FormModel>) => {
          if (target.field) {
            const provided = resolveProvidedValue(data, target)
            if (target.hook) {
              formHook.bind({
                hook: target.hook,
                model: data,
                field: target.field,
                value: provided,
              })
            }
            const nextValue = data[target.field] ?? provided
            if (nextValue !== undefined) {
              form[target.field] = cloneDeep(nextValue)
            }
          }
          target.children?.forEach(deep)
        }

        deep(item as InternalItem<FormModel>)
      })
    }

    function resolveValue<V>(input: V | ((ctx: RenderContext) => V), ctx: RenderContext): V | undefined {
      if (isFunction(input)) {
        return input(ctx)
      }
      return input
    }

    function resolveContent(content: FormRenderContent | undefined, ctx: RenderContext) {
      if (!content) {
        return null
      }
      if (isFunction(content)) {
        return (content as (context: RenderContext) => any)(ctx)
      }
      return content
    }

    function resolveBoolean(value: boolean | ((ctx: RenderContext) => boolean) | undefined, ctx: RenderContext) {
      if (isFunction(value)) {
        return value(ctx)
      }
      return Boolean(value)
    }

    function renderComponent(item: InternalItem, ctx: RenderContext) {
      const component = item.component
      if (!component) {
        return item.field ? h("span", form[item.field]) : null
      }

      const slotName = resolveValue(component.slot, ctx)
      if (slotName && slots[slotName]) {
        return slots[slotName]({ model: form, field: item.field })
      }

      const target = resolveValue(component.is, ctx)
      if (!target) {
        return null
      }

      const props = { ...(resolveValue(component.props, ctx) || {}) }
      const styleValue = resolveValue(component.style, ctx)
      const events = resolveValue(component.on, ctx) || {}
      const slotMap = resolveValue(component.slots, ctx)
      const slotsNode = slotMap
        ? Object.keys(slotMap).reduce((acc, name) => {
            acc[name] = () => resolveContent(slotMap[name], ctx)
            return acc
          }, {} as Record<string, () => any>)
        : undefined

      const options = resolveValue(component.options, ctx)
      if (options && props.options === undefined) {
        props.options = options
      }

      if (item.field) {
        props.modelValue = form[item.field]
        props["onUpdate:modelValue"] = (val: any) => {
          form[item.field as string] = val
        }
      }

      if (component.ref) {
        props.ref = component.ref
      }

      return h(target, { ...props, ...events, style: styleValue }, slotsNode)
    }

    function renderFormItem(item: InternalItem) {
      if (item.type === "tabs") {
        const labels = item.props?.labels || []
        const modelValue = Tabs.active.value ?? labels[0]?.value
        if (!Tabs.active.value && modelValue) {
          Tabs.set(modelValue)
        }
        return (
          <ElTabs
            class="fd-form__tabs"
            modelValue={Tabs.active.value}
            onUpdate:modelValue={async (val: string) => {
              try {
                await Tabs.change(val)
                Tabs.onLoad(val)
              }
              catch {
                // ignore
              }
            }}
            {...item.props}
          >
            {labels.map(label => (
              <ElTabPane key={label.value} name={label.value} label={label.label} />
            ))}
          </ElTabs>
        )
      }

      const ctx: RenderContext = { model: form, item, field: item.field }
      const hidden = isBoolean(item.hidden) || isFunction(item.hidden) ? resolveBoolean(item.hidden, ctx) : false
      item._hidden = hidden
      const inGroup = item.group ? item.group === Tabs.active.value : true
      const loaded = item.group ? Tabs.isLoaded(item.group) : true
      if (!loaded) {
        return null
      }

      const required = resolveBoolean(item.required as any, ctx)
      const disabledFlag = resolveBoolean(item.disabled as any, ctx)
      const { span = style.form?.span || 12 } = item
      const colSpan = browser.isMini ? 24 : span

      const labelSlot = () => {
        if (item.renderLabel) {
          return resolveContent(item.renderLabel, ctx)
        }
        return item.label
      }

      const childrenBlock = item.children?.length
        ? (
            <div class="fd-form-item__children">
              <ElRow gutter={10}>
                {item.children.map((child, idx) => (
                  <ElCol span={child.span || 24} key={(child.field as string) || idx}>
                    {renderFormItem(child as InternalItem)}
                  </ElCol>
                ))}
              </ElRow>
            </div>
          )
        : null

      const sections = ["prepend", "component", "append"] as const
      const content = (
        <div class="fd-form-item">
          {sections.map((section) => {
            const body = section === "component" ? renderComponent(item, ctx) : resolveContent(item[section], ctx)
            if (!body) {
              return null
            }
            return (
              <div class={[
                `fd-form-item__${section}`,
                {
                  flex1: item.flex !== false,
                },
              ]}
              >
                {body}
                {section === "component" && childrenBlock}
              </div>
            )
          })}

          {isBoolean(item.collapse) && (
            <div
              class="fd-form-item__collapse"
              onClick={() => {
                Action.collapseItem(item)
              }}
            >
              <ElDivider content-position="center">
                {item.collapse ? dict.label.seeMore : dict.label.hideContent}
              </ElDivider>
            </div>
          )}
        </div>
      )

      const rules = disabledFlag ? undefined : item.rules
      const requiredFlag = hidden ? false : required

      const formItemNode = (
        <ElFormItem
          class={{
            "no-label": !(item.renderLabel || item.label),
            "has-children": Boolean(item.children?.length),
          }}
          prop={item.field as string}
          rules={rules}
          required={requiredFlag}
          label-width={props.inline ? "auto" : style.form?.labelWidth}
          v-show={inGroup && !hidden}
          data-group={item.group || "-"}
          data-prop={item.field || "-"}
        >
          {{
            label: labelSlot,
            default: () => content,
          }}
        </ElFormItem>
      )

      if (props.inline) {
        return formItemNode
      }

      return (
        <ElCol span={colSpan} v-show={inGroup && !hidden} key={item.field as string}>
          {formItemNode}
        </ElCol>
      )
    }

    function renderItems() {
      const items = config.items.map(item => renderFormItem(item as InternalItem))
      return props.inline ? items : <ElRow gutter={10}>{items}</ElRow>
    }

    function renderContainer() {
      const labelPosition = browser.isMini && !props.inline ? "top" : config.props.labelPosition || style.form?.labelPosition || "right"
      return (
        <div class="fd-form__container" ref={setRefs("form")}>
          <ElForm
            ref={Form}
            inline={props.inline}
            disabled={disabled.value || saving.value}
            model={form}
            label-position={labelPosition}
            size={style.size}
            onSubmit={(e: Event) => {
              e.preventDefault()
              submit()
            }}
            {...config.props}
          >
            <div class={["fd-form__items", { "is-loading": loading.value }]}>
              {slots.prepend?.({ scope: form })}
              {renderItems()}
              {slots.append?.({ scope: form })}
            </div>
          </ElForm>
        </div>
      )
    }

    function renderFooter() {
      const { hidden, buttons = [], saveButtonText, closeButtonText, justify = "flex-end" } = config.op
      if (hidden) {
        return null
      }

      const nodes = buttons.map((button) => {
        if (button === "save") {
          return (
            <ElButton type="success" size={style.size} loading={saving.value} disabled={loading.value} onClick={() => submit()}>
              {saveButtonText || dict.label.save}
            </ElButton>
          )
        }
        if (button === "close") {
          return (
            <ElButton size={style.size} onClick={() => close("close")}>
              {closeButtonText || dict.label.close}
            </ElButton>
          )
        }
        if (typeof button === "string" && button.startsWith("slot-")) {
          const slotName = button.slice(5)
          return slots[slotName]?.({ scope: form }) ?? null
        }
        if (typeof button === "object" && button) {
          if (button.render) {
            return button.render({ model: form })
          }
          return (
            <ElButton type={button.type} {...button.props} onClick={() => button.onClick?.({ model: form })}>
              {button.label}
            </ElButton>
          )
        }
        return null
      })

      return (
        <div class="fd-form__footer" style={{ justifyContent: justify }}>
          {nodes}
        </div>
      )
    }

    const context: FormExpose = {
      name: props.name,
      refs,
      Form,
      visible,
      saving,
      form,
      config,
      loading,
      disabled,
      open,
      close,
      done,
      clear,
      reset,
      submit,
      invokeData,
      bindForm,
      showLoading,
      hideLoading,
      setDisabled,
      Tabs,
      ...Action,
      ...elFormApi,
    }

    expose(context)

    return () => {
      if (props.inner) {
        return (
          visible.value && (
            <div class="fd-form">
              {renderContainer()}
              {renderFooter()}
            </div>
          )
        )
      }

      return h(
        "fd-dialog",
        {
          "class": "fd-form",
          "modelValue": visible.value,
          "onUpdate:modelValue": (val: boolean) => {
            visible.value = val
          },
          "title": config.title,
          "height": config.height,
          "width": config.width,
          ...config.dialog,
          beforeClose,
          onClosed,
        },
        {
          default: () => renderContainer(),
          footer: () => renderFooter(),
        },
      )
    }
  },
})
