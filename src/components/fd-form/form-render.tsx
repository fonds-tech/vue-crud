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

/**
 * 动态组件解析
 * @description 兼容字符串组件名(如 'el-input')与 Vue 组件对象
 * @param type 组件类型，可能是字符串标签名或组件对象
 * @returns 解析后的 Vue 组件或 undefined
 */
function resolveComponent(type: string | VueComponent | undefined) {
  if (!type)
    return undefined
  if (typeof type === "string") {
    const dyn = resolveDynamicComponent(type)
    return dyn as any
  }
  return type
}

/**
 * 构建插槽映射
 * @description 遍历组件配置中的 slots 定义，生成 Vue 渲染函数所需的 slots 对象
 * @param helpers 表单辅助函数集合
 * @param slots Vue 插槽对象 (父组件传入)
 * @param model 表单数据模型
 * @param slotMap 组件的 slots 配置 { [slotName]: slotContent }
 * @param slotProps 传递给插槽的 props
 * @returns Vue 渲染函数可用的 slots 对象
 */
function renderComponentSlotMap(
  helpers: FormHelpers,
  slots: Slots,
  model: FormRecord,
  slotMap: Record<string, any>,
  slotProps: Record<string, any> = {},
) {
  const entries = Object.entries(slotMap).map(([name, value]) => {
    // 延迟执行渲染，确保插槽内容能获取到最新的上下文
    return [
      name,
      () => renderSlotOrComponent(helpers, slots, model, value, slotProps),
    ] as const
  })
  return Object.fromEntries(entries)
}

/**
 * 渲染插槽内容或动态组件
 * @description 统一处理 slot 引用、组件配置对象、字符串等多种形式的内容
 * 1. 优先查找具名插槽
 * 2. 其次尝试解析为组件
 * @param helpers 表单辅助函数集合
 * @param slots Vue 插槽对象
 * @param model 表单数据模型
 * @param com 组件配置或插槽内容标识
 * @param slotProps 传递给插槽或组件的上下文 props
 * @returns 渲染出的 VNode 或 null
 */
function renderSlotOrComponent(
  helpers: FormHelpers,
  slots: Slots,
  model: FormRecord,
  com?: any,
  slotProps: Record<string, any> = {},
) {
  // 1. 尝试渲染为外部传入的具名插槽
  const name = helpers.slotNameOf(com)
  if (name && slots[name]) {
    return slots[name]!({ model, ...slotProps })
  }

  // 2. 尝试渲染为配置的组件
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

/**
 * 渲染表单控件 (Core)
 * @description 渲染 input/select 等具体控件，绑定 v-model 和 change 事件
 * @param ctx 表单渲染上下文
 * @param item 表单项配置
 * @returns 控件 VNode 或 null
 */
function renderControl(ctx: FormRenderContext, item: FormItem) {
  const { helpers, model, slots } = ctx
  const componentType = helpers.is(item.component)
  if (!componentType)
    return null

  const resolved = resolveComponent(componentType)
  if (!resolved)
    return null

  const listeners = helpers.normalizeListeners(helpers.onListeners(item.component))
  // 传递 item 和 model 给子插槽，方便自定义渲染
  const childSlots = renderComponentSlotMap(helpers, slots, model, helpers.slotsOf(item.component), { item, model })

  return h(resolved, {
    ...helpers.formatProps.value(item), // 自动注入 props (placeholder等)
    "ref": helpers.bindComponentRef(item.component),
    "modelValue": helpers.getModelValue(item.prop),
    "style": helpers.styleOf(item.component),
    // 双向绑定核心：写入 model
    "onUpdate:modelValue": (val: any) => helpers.setModelValue(item.prop, val),
    ...listeners,
  }, childSlots)
}

/**
 * 渲染表单项的额外插槽 (Label/Error 等)
 * @param helpers 表单辅助函数
 * @param slots Vue 插槽对象
 * @param model 表单数据模型
 * @param item 表单项配置
 * @returns 插槽 VNode 数组
 */
function renderItemSlots(helpers: FormHelpers, slots: Slots, model: FormRecord, item: FormItem) {
  const slotMap = helpers.slotsOf(item)
  const entries = Object.entries(slotMap).map(([name, com]) => (
    <span key={name}>
      {renderSlotOrComponent(helpers, slots, model, com, { model, item })}
    </span>
  ))
  return entries
}

/**
 * 渲染单个表单项 (Form Item)
 * @description 包含 GridItem -> FormItem -> (Slots + Control + Extra)
 * @param ctx 表单渲染上下文
 * @param item 表单项配置
 * @param index 表单项索引
 * @param groupName 当前所属分组名称 (可选)
 * @returns 表单项 VNode
 */
function renderFormItem(ctx: FormRenderContext, item: FormItem, index: number, groupName?: string | number) {
  const { helpers, slots, model } = ctx
  const key = helpers.propKey(item.prop, index)

  // 判断显隐：结合 hidden 属性与 Tab 分组
  const visible = groupName !== undefined ? helpers.showInGroup(item, groupName) : helpers.show(item)

  const extraContent = helpers.extra(item)

  // 控件主体内容：优先使用 slot 覆盖，否则渲染标准控件
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
              {/* 自定义插槽渲染 (如 label 插槽) */}
              {renderItemSlots(helpers, slots, ctx.model, item)}
              {/* 控件主体 */}
              {mainContent}
            </>
          ),
        }}
      />
    </fd-grid-item>
  )
}

/**
 * 渲染栅格布局容器
 * @param ctx 表单渲染上下文
 * @param items 表单项列表
 * @param groupName 所属分组名称 (可选)
 * @returns 栅格 VNode
 */
function renderGrid(ctx: FormRenderContext, items: FormItem[], groupName?: string | number) {
  const { options } = ctx
  return (
    <fd-grid {...options.grid}>
      {items.map((item, index) => renderFormItem(ctx, item, index, groupName))}
    </fd-grid>
  )
}

/**
 * 渲染步骤条 (Steps)
 * @param ctx 表单渲染上下文
 * @returns 步骤条 VNode 或 null
 */
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

/**
 * 渲染标签页 (Tabs)
 * @param ctx 表单渲染上下文
 * @returns 标签页 VNode 或 null
 */
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
        const groupName = child.name ?? index

        return (
          <el-tab-pane
            key={groupName}
            label={child.title}
            name={groupName}
            {...helpers.componentProps(child.component)}
            v-slots={childSlots}
          >
            {/* Tab 面板顶部内容 */}
            {renderSlotOrComponent(helpers, slots, model, child.component, { model, scope: { name: child.name } })}
            {/* Tab 内部的表单栅格 */}
            {renderGrid(ctx, helpers.itemsOfGroup(groupName), groupName)}
          </el-tab-pane>
        )
      })}
    </el-tabs>
  )
}

/**
 * 渲染整个表单容器
 * @description 组合 Steps/Tabs/Grid 布局
 * @param ctx 表单渲染上下文
 * @returns 表单 VNode
 */
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
        {/* 如果不是 Tabs 模式，直接渲染所有项；如果是 Steps，通常也在这里渲染，但逻辑可能需要根据 Step 过滤？
            当前逻辑：Steps 模式下，上方显示步骤条，下方渲染所有项。
            如果 Steps 需要分步显示，itemsOfGroup 逻辑目前仅支持 Tabs。
            TODO: 完善 Steps 分步显示逻辑，或者假设 Steps 模式下 items 是展平的。
            目前保留原逻辑：!showTabs 才渲染 Grid。
        */}
        {!showTabs && renderGrid(ctx, options.items)}
      </el-space>
    </el-form>
  )
}
