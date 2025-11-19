import type { CrudOptions } from '../../types'
import Mitt from '@/utils/mitt'
import { useConfig } from '../../hooks'
import { merge, cloneDeep } from 'lodash-es'
import { inject, provide, reactive, defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  name: 'fd-crud',
  props: {
    // 组件名
    name: String,
  },
  setup(props, { slots, expose }) {
    const ins = getCurrentInstance()
    const mitt = new Mitt()
    const config = useConfig()
    const options = reactive<CrudOptions>(inject('__crud_options__', {} as CrudOptions))

    const crud = reactive(
      merge(
        {
          id: props.name || ins?.uid,
          // 表格加载状态
          loading: false,
          // 表格已选列
          selection: [],
          // 请求参数
          params: {
            page: 1,
            size: 20,
          },
          // 请求服务
          service: {},
          // 字典
          dict: {},
          // 权限
          permission: {},
          // 事件
          mitt,
          // 配置
          config: options,
        },
        cloneDeep({ dict: config.dict, permission: config.permission }),
      ),
    )

    provide('crud', crud)
    provide('mitt', mitt)

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
