import type { ImportResult } from "./type"
import type { VNode, PropType, ExtractPropTypes } from "vue"

import { useCore } from "@/hooks"
import { isFunction } from "@/utils/check"
import { ref, watch, defineComponent } from "vue"
import { ElButton, ElUpload, ElMessage } from "element-plus"

/**
 * 导入按钮组件 Props 定义
 */
const importProps = {
  /**
   * 允许的文件类型
   * @default '.xlsx,.xls,.csv'
   */
  accept: {
    type: String,
    default: ".xlsx,.xls,.csv",
  },
  /**
   * 额外的上传参数
   * @description 会附加到 FormData 中
   */
  params: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  /**
   * 模板下载地址
   * @description 如果提供，会显示下载模板按钮
   */
  templateUrl: {
    type: String,
    default: "",
  },
  /**
   * 最大文件大小 (MB)
   * @default 10
   */
  maxSize: {
    type: Number,
    default: 10,
  },
} as const

export type ImportProps = ExtractPropTypes<typeof importProps>

/**
 * fd-import 导入按钮组件
 * @description 提供文件导入功能，支持 Excel/CSV 文件上传
 */
export default defineComponent({
  name: "fd-import",
  inheritAttrs: false,
  props: importProps,
  setup(props, { slots, expose }) {
    const { crud } = useCore()

    // 导入加载状态
    const loading = ref(false)
    // 当前选中项的 ID 列表（用于关联导入）
    const selection = ref<string[]>([])

    /**
     * 验证文件
     * @param file - 待验证的文件
     * @returns 是否通过验证
     */
    function validateFile(file: File): boolean {
      // 检查文件类型
      const acceptTypes = props.accept.split(",").map(t => t.trim().toLowerCase())
      const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`
      if (!acceptTypes.includes(fileExt)) {
        ElMessage.error(`不支持的文件类型，请上传 ${props.accept} 格式的文件`)
        return false
      }

      // 检查文件大小
      const maxBytes = props.maxSize * 1024 * 1024
      if (file.size > maxBytes) {
        ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
        return false
      }

      return true
    }

    /**
     * 处理文件上传
     * @param file - 上传的文件
     */
    async function handleUpload(file: File): Promise<ImportResult | undefined> {
      // 检查是否配置了导入方法
      if (!isFunction(crud.service.import)) {
        ElMessage.error("Crud 未配置 import 方法")
        throw new Error("Crud 未配置 import 方法")
      }

      // 验证文件
      if (!validateFile(file)) {
        return
      }

      loading.value = true

      try {
        // 构建 FormData
        const formData = new FormData()
        formData.append("file", file)

        // 添加选中项 ID（如果有）
        if (selection.value.length > 0) {
          formData.append("ids", selection.value.join(","))
        }

        // 添加额外参数
        Object.entries(props.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })

        // 调用导入 API
        const res: ImportResult = await crud.service.import(formData)

        // 处理导入结果
        if (res?.success !== false) {
          const count = res?.count ?? 0
          ElMessage.success(`导入成功${count > 0 ? `，共 ${count} 条数据` : ""}`)
          // 刷新列表
          crud.refresh?.()
        }

        // 如果有错误信息，显示警告
        if (res?.errors?.length) {
          const errorMsg = res.errors
            .slice(0, 5)
            .map(e => `第 ${e.row ?? "?"} 行: ${e.message}`)
            .join("\n")
          const moreMsg = res.errors.length > 5 ? `\n...还有 ${res.errors.length - 5} 条错误` : ""
          ElMessage.warning({
            message: `部分数据导入失败:\n${errorMsg}${moreMsg}`,
            duration: 5000,
          })
        }

        return res
      }
      catch (err) {
        ElMessage.error("导入失败")
        throw err
      }
      finally {
        loading.value = false
      }
    }

    /**
     * el-upload 的 before-upload 钩子
     * @description 拦截上传，使用自定义逻辑处理
     */
    function beforeUpload(file: File) {
      handleUpload(file)
      // 返回 false 阻止 el-upload 的默认上传行为
      return false
    }

    /**
     * 下载导入模板
     */
    function downloadTemplate() {
      if (props.templateUrl) {
        window.open(props.templateUrl, "_blank")
      }
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

    // 暴露方法给父组件调用
    expose({
      import: handleUpload,
      downloadTemplate,
    })

    // 渲染函数
    return (): VNode | null => {
      // 检查导入权限
      if (!crud.getPermission("import" as any)) {
        return null
      }

      // 渲染上传按钮
      const uploadButton = slots.default?.() ?? (
        <ElButton loading={loading.value} type="success">
          导入
        </ElButton>
      )

      // 渲染模板下载按钮
      const templateButton = props.templateUrl && slots.template?.() !== undefined
        ? slots.template?.()
        : props.templateUrl
          ? (
              <ElButton type="info" onClick={downloadTemplate}>
                下载模板
              </ElButton>
            )
          : null

      return (
        <div class="fd-import">
          <ElUpload
            class="fd-import__upload"
            accept={props.accept}
            showFileList={false}
            beforeUpload={beforeUpload}
          >
            {uploadButton}
          </ElUpload>
          {templateButton && <div class="fd-import__template">{templateButton}</div>}
        </div>
      )
    }
  },
})
