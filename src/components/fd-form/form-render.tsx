import type { FormHelpers } from "./useFormEngine"
import type { FormInstance } from "element-plus"
import type { FormItem, FormRecord, FormOptions } from "./type"
import type { Ref, Slots, ComputedRef, Component as VueComponent } from "vue"
import { h, resolveDynamicComponent } from "vue"

// 渲染上下文：将引擎状态与渲染所需依赖打包传入纯渲染函数
export interface FormRenderContext {
  formRef: Ref<FormInstance | undefined>
  options: FormOptions
  model: FormRecord
  step: Ref<number>
  activeGroupName: Ref<string | number | undefined>
  resolvedActiveGroup: ComputedRef<string | number | undefined>
  helpers: FormHelpers
  slots: Slots
  attrs: Record<string, any>
}

// 动态组件解析：兼容字符串组件名与组件对象
function resolveComponent(type: string | VueComponent | undefined) {
  if (!type)
    return undefined
  if (typeof type === "string") {
    const dyn = resolveDynamicComponent(type)
    return dyn as any
  }
  return type
}

// 构建插槽映射，延迟执行以携带上下文参数
function renderComponentSlotMap(
  helpers: FormHelpers,
  slots: Slots,
  model: FormRecord,
  slotMap: Record<string, any>,
  slotProps: Record<string, any> = {},
) {
  const entries = Object.entries(slotMap).map(([name, value]) => {
    return [
      name,
      () => renderSlotOrComponent(helpers, slots, model, value, slotProps),
    ] as const
  })
  return Object.fromEntries(entries)
}

// 渲染命名插槽或动态组件（带事件、样式、子插槽）
function renderSlotOrComponent(
  helpers: FormHelpers,
  slots: Slots,
  model: FormRecord,
  com?: any,
  slotProps: Record<string, any> = {},
) {
  const name = helpers.slotNameOf(com)
  if (name && slots[name]) {
    return slots[name]!({ model, ...slotProps })
  }
  const componentType = helpers.is(com)
  if (!componentType)
    return null
  const resolved = resolveComponent(componentType)
  if (!resolved)
    return null
  const listeners = helpers.normalizeListeners(helpers.onListeners(com))
  const childSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(com), slotProps)
  return h(resolved, {
    ...helpers.componentProps(com),
    ref: helpers.bindComponentRef(com),
    style: helpers.styleOf(com),
    ...listeners,
  }, childSlots)
}

// 渲染表单控件，绑定 v-model 与事件，透传子插槽
function renderControl(ctx: FormRenderContext, item: FormItem) {
  const { helpers, model, slots } = ctx
  const componentType = helpers.is(item.component)
  if (!componentType)
    return null
  const resolved = resolveComponent(componentType)
  if (!resolved)
    return null
  const listeners = helpers.normalizeListeners(helpers.onListeners(item.component))
  const childSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(item.component), { item, model })

  return h(resolved, {
    ...helpers.formatProps.value(item),
    "ref": helpers.bindComponentRef(item.component),
    "modelValue": helpers.getModelValue(item.prop),
    "style": helpers.styleOf(item.component),
    "onUpdate:modelValue": (val: any) => helpers.setModelValue(item.prop, val),
    ...listeners,
  }, childSlots)
}

// 渲染表单项自定义 slots 配置
function renderItemSlots(helpers: FormHelpers, slots: Slots, model: FormRecord, item: FormItem) {
  const slotMap = helpers.slotsOf(item)
  const entries = Object.entries(slotMap).map(([name, com]) => (
    <span key={name}>
      {renderSlotOrComponent(helpers, slots, model, com, { model, item })}
    </span>
  ))
  return entries
}

// 渲染单个表单项（含额外信息、主控件与自定义插槽）
function renderFormItem(ctx: FormRenderContext, item: FormItem, index: number, groupName?: string | number) {
  const { helpers, slots, model } = ctx
  const key = helpers.propKey(item.prop, index)
  const visible = groupName !== undefined ? helpers.showInGroup(item, groupName) : helpers.show(item)
  const extraContent = helpers.extra(item)
  const mainSlotName = helpers.slotNameOf(item.component)
  const mainContent = mainSlotName && slots[mainSlotName]
    ? slots[mainSlotName]!({ model, item })
    : renderControl(ctx, item)

  return (
    <fd-grid-item key={key} v-show={visible} span={helpers.resolveSpan(item)} offset={helpers.resolveOffset(item)}>
      <el-form-item
        {...item}
        prop={item.prop}
        rules={helpers.rules(item)}
        required={helpers.required(item)}
        v-slots={{
          extra: extraContent ? () => extraContent : undefined,
          default: () => (
            <>
              {renderItemSlots(helpers, slots, ctx.model, item)}
              {mainContent}
            </>
          ),
        }}
      />
    </fd-grid-item>
  )
}

// 渲染表单栅格容器
function renderGrid(ctx: FormRenderContext, items: FormItem[], groupName?: string | number) {
  const { options } = ctx
  return (
    <fd-grid {...options.grid}>
      {items.map((item, index) => renderFormItem(ctx, item, index, groupName))}
    </fd-grid>
  )
}

// 渲染步骤条模式
function renderSteps(ctx: FormRenderContext) {
  const { options, step, model, helpers, slots } = ctx
  if (!(options.group?.type === "steps" && options.group.children?.length))
    return null
  const stepSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(options.group.component), {})

  return (
    <el-steps
      active={step.value}
      {...helpers.componentProps(options.group.component)}
      style={helpers.styleOf(options.group.component)}
      v-slots={stepSlots}
    >
      {options.group.children.map((child, index) => {
        const childSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(child.component), { step: index, model })
        return (
          <el-step
            key={child.name ?? index}
            title={child.title}
            {...helpers.componentProps(child.component)}
            v-slots={childSlots}
          >
            {renderSlotOrComponent(helpers, slots, model, child.component, { step: index, model })}
          </el-step>
        )
      })}
    </el-steps>
  )
}

// 渲染标签页模式
function renderTabs(ctx: FormRenderContext) {
  const { options, activeGroupName, model, helpers, slots } = ctx
  if (!(options.group?.type === "tabs" && options.group.children?.length))
    return null

  const tabSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(options.group.component), { model })

  return (
    <el-tabs
      v-model={activeGroupName.value}
      {...helpers.componentProps(options.group.component)}
      style={helpers.styleOf(options.group.component)}
      v-slots={tabSlots}
    >
      {options.group.children.map((child, index) => {
        const childSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(child.component), { model, name: child.name })
        return (
          <el-tab-pane
            key={child.name ?? index}
            label={child.title}
            name={child.name ?? index}
            {...helpers.componentProps(child.component)}
            v-slots={childSlots}
          >
            {renderSlotOrComponent(helpers, slots, model, child.component, { model, scope: { name: child.name } })}
            {renderGrid(ctx, helpers.itemsOfGroup(child.name ?? index), child.name ?? index)}
          </el-tab-pane>
        )
      })}
    </el-tabs>
  )
}

// 渲染整个表单容器
export function renderForm(ctx: FormRenderContext) {
  const { options, model, attrs, formRef } = ctx
  const groupType = options.group?.type
  const showTabs = groupType === "tabs"
  const showSteps = groupType === "steps"

  return (
    <el-form
      ref={formRef}
      key={options.key}
      class="fd-form"
      model={model}
      {...options.form}
      {...attrs}
    >
      <el-space direction="vertical" fill size={24}>
        {showSteps && renderSteps(ctx)}
        {showTabs && renderTabs(ctx)}
        {!showTabs && renderGrid(ctx, options.items)}
      </el-space>
    </el-form>
  )
}
