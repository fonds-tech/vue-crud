import type { DetailData, DetailItem, DetailGroup, DetailAction, DetailMaybeFn, DetailOptions } from "./types"
import { h } from "vue"
import { ElTag, ElSpace, ElButton, ElDescriptions, ElDescriptionsItem } from "element-plus"
import { slotsOf, slotNameOf, componentOf, resolveMaybe, componentProps, componentSlots, componentStyle, componentEvents } from "./slots"

interface RenderCtx<D extends DetailData = DetailData> {
  options: DetailOptions<D>
  groups: Array<DetailGroup<D> & { items: DetailItem<D>[], descriptions: any }>
  data: { value: D }
  loading: { value: boolean }
  cache: { value: number }
  userSlots: Record<string, ((props: any) => any) | undefined>
  onClose: () => void
}

/** 判断显隐，支持布尔与函数隐藏条件。 */
function isVisible<D extends DetailData>(target: { hidden?: DetailMaybeFn<boolean, D> }, data: D) {
  const hidden = target?.hidden
  if (typeof hidden === "function")
    return !hidden(data)
  return !hidden
}

/** 解析字段标题。 */
function resolveLabel<D extends DetailData>(item: DetailItem<D>, data: D) {
  return resolveMaybe(item.label, data) ?? ""
}

/** 获取字段值，兼容默认值。 */
function getFieldValue<D extends DetailData>(item: DetailItem<D>, data: D) {
  const prop = (item as DetailItem & { field?: string }).prop ?? (item as { field?: string }).field
  if (!prop)
    return resolveMaybe(item.value, data)
  const current = (data ?? {})[prop as any]
  if (current === undefined || current === null)
    return resolveMaybe(item.value, data)
  return current
}

function resolveDict<D extends DetailData>(item: DetailItem<D>, data: D) {
  return resolveMaybe(item.dict, data)
}

function getDictMatch<D extends DetailData>(item: DetailItem<D>, data: D) {
  const dict = resolveDict(item, data)
  if (!dict)
    return undefined
  const value = getFieldValue(item, data)
  return dict.find(d => d.value === value)
}

function tagType(match?: ReturnType<typeof getDictMatch>) {
  const type = match?.type
  if (!type || type === "default")
    return undefined
  return type
}

function formatValue<D extends DetailData>(item: DetailItem<D>, data: D) {
  const value = getFieldValue(item, data)
  if (typeof item.formatter === "function")
    return item.formatter(value, data)
  return value ?? ""
}

function resolveActionText<D extends DetailData>(action: DetailAction<D>, options: DetailOptions<D>, data: D) {
  return resolveMaybe(action.text, data) ?? options.dialog.title ?? "确定"
}

function renderComponentSlot<D extends DetailData>(componentSlot: any, data: D, extra: Record<string, any> = {}, userSlots?: Record<string, ((props: any) => any) | undefined>) {
  const slotName = slotNameOf(componentSlot, data)
  if (slotName && userSlots?.[slotName]) {
    return userSlots[slotName]?.(extra)
  }
  const component = componentOf(componentSlot, data)
  if (component) {
    const childrenSlots = componentSlots(componentSlot, data)
    const vSlots = Object.fromEntries(
      Object.entries(childrenSlots).map(([childSlot, value]) => [
        childSlot,
        () => renderSlotValue(value),
      ]),
    )
    return h(
      component as any,
      {
        ...componentProps(componentSlot, data),
        style: componentStyle(componentSlot, data),
        ...componentEvents(componentSlot, data),
        ...extra,
      },
      vSlots,
    )
  }
  return null
}

function renderSlotValue(value: any) {
  if (typeof value === "function")
    return value()
  return h(value as any, { "data-detail-slot": true })
}

function renderItemContent<D extends DetailData>(item: DetailItem<D>, data: D, userSlots: Record<string, ((props: any) => any) | undefined>, index: number) {
  const slotMap = slotsOf(item, data)
  const slotEntries = Object.entries(slotMap).map(([slotName, slotComponent]) => {
    const content = renderComponentSlot(
      slotComponent,
      data,
      { index, data, value: getFieldValue(item, data) },
      userSlots,
    )
    return content ? h("template", { key: slotName }, content) : null
  })

  const directSlotName = slotNameOf(item.component, data)
  const directSlot = directSlotName && userSlots[directSlotName]
    ? userSlots[directSlotName]?.({ index, data, value: getFieldValue(item, data) })
    : null

  const directComponent = renderComponentSlot(item.component, data, { index, data, value: getFieldValue(item, data) }, userSlots)

  const dictMatch = getDictMatch(item, data)

  return [
    ...slotEntries,
    directSlot,
    directComponent,
    !directSlot && !directComponent && resolveDict(item, data)
      ? dictMatch
        ? h(ElTag, { type: tagType(dictMatch), color: dictMatch.color }, () => dictMatch.label)
        : formatValue(item, data)
      : null,
    !directSlot && !directComponent && !resolveDict(item, data) ? formatValue(item, data) : null,
  ]
}

function renderGroupSlots<D extends DetailData>(group: DetailGroup<D>, data: D, userSlots: Record<string, ((props: any) => any) | undefined>) {
  const groupSlots = slotsOf(group.descriptions, data)
  return Object.entries(groupSlots).map(([slotName, slotComponent]) => {
    const slotNameResolved = slotNameOf(slotComponent, data)
    if (slotNameResolved && userSlots[slotNameResolved]) {
      return h("template", { key: slotName }, userSlots[slotNameResolved]?.({ data, group }))
    }
    const component = renderComponentSlot(slotComponent, data, { data, group }, userSlots)
    return component ? h("template", { key: slotName }, component) : null
  })
}

export function renderDetailContent<D extends DetailData = DetailData>(ctx: RenderCtx<D>) {
  return h(
    ElSpace,
    {
      "key": ctx.cache.value,
      "class": "fd-detail__space",
      "v-loading": ctx.loading.value,
      "element-loading-text": ctx.options.dialog.loadingText,
      "direction": "vertical",
      "fill": true,
      "size": 16,
    },
    () =>
      ctx.groups.map((group, groupIndex) =>
        h(
          ElDescriptions,
          {
            key: group.name ?? groupIndex,
            title: resolveMaybe(group.title, ctx.data.value),
            ...group.descriptions,
          },
          () => [
            ...renderGroupSlots(group, ctx.data.value, ctx.userSlots),
            ...group.items
              .filter(item => isVisible(item, ctx.data.value))
              .map((item, itemIndex) =>
                h(
                  ElDescriptionsItem,
                  {
                    key: item.prop ?? itemIndex,
                    label: resolveLabel(item, ctx.data.value),
                    span: item.span ?? 1,
                  },
                  {
                    default: () => renderItemContent(item, ctx.data.value, ctx.userSlots, itemIndex),
                    label: ctx.userSlots.label
                      ? () => ctx.userSlots.label?.({
                          index: itemIndex,
                          data: ctx.data.value,
                          value: getFieldValue(item, ctx.data.value),
                          item,
                        })
                      : undefined,
                  },
                ),
              ),
          ],
        ),
      ),
  )
}

export function renderActions<D extends DetailData = DetailData>(ctx: RenderCtx<D>) {
  return h(
    "div",
    { class: "fd-detail__footer" },
    () =>
      ctx.options.actions.map((action, index) => {
        if (!isVisible(action, ctx.data.value))
          return null
        if (action.type === "ok") {
          return h(
            ElButton,
            {
              key: index,
              type: "primary",
              onClick: ctx.onClose,
            },
            () => resolveActionText(action, ctx.options, ctx.data.value),
          )
        }
        const slotName = slotNameOf(action.component, ctx.data.value)
        if (slotName && ctx.userSlots[slotName]) {
          return h(
            "template",
            { key: index },
            ctx.userSlots[slotName]?.({ index, data: ctx.data.value }),
          )
        }
        const comp = renderComponentSlot(action.component, ctx.data.value, { index, data: ctx.data.value }, ctx.userSlots)
        return comp ? h("template", { key: index }, comp) : null
      }),
  )
}
