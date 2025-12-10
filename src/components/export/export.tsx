import type { VNode } from "vue"
import { useCore } from "@/hooks"
import { isFunction } from "@fonds/utils"
import { exportProps } from "./export"
import { downloadFile } from "@/utils/file"
import { ElButton, ElMessage } from "element-plus"
import { ref, watch, defineComponent } from "vue"

/**
 * fd-export 导出按钮组件
 * @description 提供数据导出功能，调用后端接口返回文件 URL 并自动下载
 */
export default defineComponent({
  name: "fd-export",
  inheritAttrs: false,
  props: exportProps,
  setup(props, { slots, expose }) {
    const { crud, mitt } = useCore()

    // 导出加载状态
    const loading = ref(false)
    // 当前选中项的 ID 列表
    const selection = ref<string[]>([])

    /**
     * 执行导出请求
     * @param params - 导出参数（通常来自搜索表单）
     * @returns Promise 导出结果
     */
    async function exportData(params: Record<string, any> = {}) {
      // 检查是否配置了导出方法
      if (!isFunction(crud.service.export)) {
        ElMessage.error("Crud 未配置 export 方法")
        throw new Error("Crud 未配置 export 方法")
      }

      loading.value = true

      try {
        // 合并选中项 ID 和额外参数
        const data = {
          ...params,
          ...props.params,
          ids: selection.value.join(","),
          id: selection.value.join(","),
        }

        const res = await crud.service.export(data)

        // 后端返回下载 URL，自动触发下载
        if (res?.url) {
          downloadFile(res.url)
          ElMessage.success("导出成功")
        }

        return res
      }
      catch (err) {
        ElMessage.error("导出失败")
        throw err
      }
      finally {
        loading.value = false
      }
    }

    /**
     * 点击导出按钮事件处理
     */
    function onClickExport() {
      // 从搜索组件获取当前搜索条件
      mitt?.emit("search.get.model", (model: Record<string, any>) => {
        exportData(model)
      })
    }

    // 监听表格选中项变化，更新选中的 ID 列表
    watch(
      () => crud.selection,
      (val) => {
        if (!val) {
          selection.value = []
          return
        }
        const primaryKey = crud.dict?.primaryId ?? "id"
        selection.value = val.map((item: any) => item[primaryKey])
      },
      { deep: true, immediate: true },
    )

    // 暴露导出方法给父组件调用
    expose({ export: exportData })

    // 渲染函数
    return (): VNode | null => {
      // 检查导出权限
      if (!crud.getPermission("export" as any)) {
        return null
      }

      // 渲染触发器插槽或默认按钮
      const triggerContent = slots.trigger?.() ?? (
        <ElButton loading={loading.value} type="warning">
          {slots.default?.() ?? "导出"}
        </ElButton>
      )

      return (
        <div class="fd-export">
          <div class="fd-export__trigger" onClick={onClickExport}>
            {triggerContent}
          </div>
        </div>
      )
    }
  },
})
