import type { CrudRef } from "../../crud/interface"
import type { FormRecord } from "../../form/interface"
import type { Ref, ComputedRef } from "vue"
import type { UpsertMode, UpsertAction, UpsertOptions } from "../interface"
import { isFunction } from "@fonds/utils"

/**
 * 动作辅助上下文
 */
interface ActionHelperContext<T extends FormRecord = FormRecord> {
  options: UpsertOptions<T>
  crud: CrudRef
  formModel: ComputedRef<T>
  mode: Ref<UpsertMode>
}

/**
 * 动作按钮与可见性解析
 *
 * 提供默认动作填充、文案解析、可见性判断，保持与 crud 字典文案一致
 *
 * @param context 动作辅助上下文
 * @returns 动作辅助工具对象
 */
export function useUpsertActions<T extends FormRecord = FormRecord>(context: ActionHelperContext<T>) {
  const { options, crud, formModel } = context

  /**
   * 确保存在默认动作（含 steps 模式的 prev/next）。
   */
  function ensureActions() {
    if (options.actions.length > 0) return
    if (options.group?.type === "steps") {
      options.actions = [
        { type: "cancel", text: crud.dict?.label?.close ?? "取消" },
        { type: "prev", text: "上一步" },
        { type: "next", text: "下一步" },
        { type: "ok", text: crud.dict?.label?.confirm ?? "确定" },
      ]
    }
    else {
      options.actions = [
        { type: "cancel", text: crud.dict?.label?.close ?? "取消" },
        { type: "ok", text: crud.dict?.label?.confirm ?? "确定" },
      ]
    }
  }

  /**
   * 解析动作文案，支持函数型文本。
   *
   * @param action 动作配置对象
   * @returns 动作文案
   */
  function resolveActionText(action: UpsertAction<T>) {
    const text = action.text
    if (isFunction(text)) return text(formModel.value)
    if (text) return text
    return action.type === "cancel" ? (crud.dict?.label?.close ?? "取消") : (crud.dict?.label?.confirm ?? "确定")
  }

  /**
   * 判断动作是否可见，支持函数型 hidden。
   *
   * @param action 动作配置对象
   * @returns 是否可见
   */
  function isActionVisible(action: UpsertAction<T>) {
    const maybeHidden = action.hidden
    if (isFunction(maybeHidden)) return !maybeHidden(formModel.value)
    return !maybeHidden
  }

  return {
    ensureActions,
    resolveActionText,
    isActionVisible,
  }
}
