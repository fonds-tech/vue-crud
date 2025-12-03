import type { CrudRef } from "@/types"
import type { FormRecord } from "../../fd-form/types"
import type { Ref, ComputedRef } from "vue"
import type { UpsertMode, UpsertAction, UpsertOptions } from "../type"
import { isFunction } from "@fonds/utils"

interface ActionHelperContext<T extends FormRecord = FormRecord> {
  options: UpsertOptions<T>
  crud: CrudRef
  formModel: ComputedRef<T>
  mode: Ref<UpsertMode>
}

export function useUpsertActions<T extends FormRecord = FormRecord>(context: ActionHelperContext<T>) {
  const { options, crud, formModel } = context

  function ensureActions() {
    if (options.actions.length > 0)
      return
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

  function resolveActionText(action: UpsertAction<T>) {
    const text = action.text
    if (isFunction(text))
      return text(formModel.value)
    if (text)
      return text
    return action.type === "cancel" ? crud.dict?.label?.close ?? "取消" : crud.dict?.label?.confirm ?? "确定"
  }

  function isActionVisible(action: UpsertAction<T>) {
    const maybeHidden = action.hidden
    if (isFunction(maybeHidden))
      return !maybeHidden(formModel.value)
    return !maybeHidden
  }

  return {
    ensureActions,
    resolveActionText,
    isActionVisible,
  }
}
