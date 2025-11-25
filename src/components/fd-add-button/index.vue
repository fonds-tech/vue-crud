<template>
  <el-button v-if="canAdd" type="primary" :size="buttonSize" @click="handleClick">
    <slot>{{ fallbackLabel }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useCore, useConfig } from "../../hooks"

defineOptions({
  name: "fd-add-button",
})

const { crud } = useCore()
const { style } = useConfig()

const canAdd = computed(() => crud.getPermission("add"))
const buttonSize = computed(() => style.size)
const fallbackLabel = computed(() => crud.dict?.label?.add ?? "新增")

function handleClick() {
  crud.rowAdd()
}
</script>
