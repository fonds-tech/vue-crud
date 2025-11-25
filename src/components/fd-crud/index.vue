<template>
  <div class="fd-crud">
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { CrudOptions } from "../../types"
import { useConfig } from "../../hooks"
import { useHelper } from "./useHelper"
import { Mitt, clone, merge } from "@fonds/utils"
import { inject, provide, reactive, defineExpose, getCurrentInstance } from "vue"

defineOptions({
  name: "fd-crud",
})

const props = defineProps<{
  name?: string
}>()

const ins = getCurrentInstance()
const mitt = new Mitt(ins?.uid)
const options = reactive<CrudOptions>(inject("__crud_options__", {} as CrudOptions))
const { dict, permission } = useConfig()

const crud = reactive<any>(
  merge(
    {
      id: props.name || ins?.uid,
      loading: false,
      selection: [],
      params: { page: 1, size: 20 },
      service: {},
      dict: {},
      permission: {},
      mitt,
      config: options,
    },
    clone({ dict, permission }),
  ),
)

function useCrudOptions(useOptions: Partial<CrudOptions> = {}) {
  merge(options, useOptions)
}

merge(crud, useHelper({ config: options, crud, mitt }))

crud.use = useCrudOptions

provide("crud", crud)
provide("mitt", mitt)

defineExpose(crud)
</script>
