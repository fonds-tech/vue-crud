<template>
  <div v-if="crud.getPermission('export' as any)" class="fd-export">
    <div class="fd-export__trigger" @click="onClickExport">
      <slot name="trigger">
        <el-button :loading="loading" type="warning">
          <slot>导出</slot>
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Options } from "./type"
import { useCore } from "@/hooks"
import { isFunction } from "@/utils/check"
import { downloadFile } from "@/utils/file"
import { merge, cloneDeep } from "lodash-es"
import { ref, watch, reactive } from "vue"
import { ElButton, ElMessage, ElNotification } from "element-plus"

defineOptions({ name: "fd-export" })

const props = defineProps({
  params: { type: Object, default: () => ({}) },
})

const { crud, mitt } = useCore()

const loading = ref(false)
const exporting = ref(false)
const selection = ref<string[]>([])
const options = reactive<Options>({ model: {} })

// 导出数据
function exportData(params: Record<string, any> = {}) {
  return new Promise((success, error) => {
    loading.value = true
    const done = () => {
      loading.value = false
      exporting.value = false
    }
    const next = (data: Record<string, any> = {}) => {
      return new Promise((resolve, reject) => {
        if (isFunction(crud.service.export)) {
          data.ids = selection.value.join(",")
          data.id = data.ids
          data = merge(data, props.params)
          crud.service
            .export(data)
            .then((res: any) => {
              success(res)
              resolve(res)
              if (res?.status === 0) {
                if (exporting.value === false) {
                  ElNotification.info({
                    title: "导出中",
                    message: "导出中，成功后会自动下载，请勿刷新页面导致下载失败",
                  })
                }
                exporting.value = true
                exportData({ ...data, page: res.page, fileName: res.fileName })
              }
              else {
                done()
                if (res?.url) {
                  downloadFile(res.url)
                  ElNotification.success({
                    title: "导出成功",
                    message: "导出成功，已自动下载",
                  })
                }
              }
            })
            .catch((err: any) => {
              done()
              error(err)
              reject(err)
            })
        }
        else {
          done()
          ElMessage.error("Crud 未配置 export 方法")
          error(new Error("Crud 未配置 export 方法"))
          reject(new Error("Crud 未配置 export 方法"))
        }
      })
    }

    if (isFunction(options.onExport)) {
      options.onExport(cloneDeep(params), { done, next })
    }
    else {
      next(cloneDeep(params))
    }
  })
}

function onClickExport() {
  mitt?.emit("search.get.model", (model: Record<string, any>) => {
    exportData(model)
  })
}

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

defineExpose({ export: exportData })
</script>

<style lang="scss" scoped>
.fd-export {
  &__trigger {
    display: flex;
  }
}
</style>
