import type { CrudOptions } from "../../types"
import { useConfig } from "../../hooks"
import { useHelper } from "./useHelper"
import { Mitt, clone, merge } from "@fonds/utils"
import { inject, provide, reactive, defineComponent, getCurrentInstance } from "vue"

export default defineComponent({
  name: "fd-crud",
  props: {
    // 组件名
    name: String,
  },
  setup(props, { slots, expose }) {
    const ins = getCurrentInstance()
    const mitt = new Mitt(ins?.uid)
    const config = useConfig() || ({} as CrudOptions)
    const options = reactive<CrudOptions>(inject("__crud_options__", {} as CrudOptions))
    const crudConfig = reactive<CrudOptions>(merge(clone(config), options))

    const crud = reactive<any>(
      merge(
        {
          id: props.name || ins?.uid,
          // 表格加载状态
          loading: false,
          // 表格已选列
          selection: [],
          // 请求参数
          params: { page: 1, size: 20 },
          // 请求服务
          service: {},
          // 字典
          dict: {},
          // 权限
          permission: {},
          // 事件
          mitt,
          // 配置
          config: crudConfig,
        },
        clone({ dict: crudConfig.dict || {}, permission: crudConfig.permission || {} }),
      ),
    )

    merge(crud, useHelper({ config, crud, mitt }))

    provide("crud", crud)
    provide("mitt", mitt)

    expose(crud)

    return () => {
      return (
        <div class="fd-crud">
          {slots.default?.()}
        </div>
      )
    }
  },
})
