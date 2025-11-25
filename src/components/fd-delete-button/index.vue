<template>
  <el-button
    v-if="canDelete"
    type="danger"
    :size="buttonSize"
    :disabled="selectionEmpty"
    @click="handleDelete"
  >
    <slot>{{ fallbackLabel }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useCore, useConfig } from "../../hooks"

defineOptions({
  name: "fd-delete-button",
})

const { crud } = useCore()
const { style } = useConfig()

const canDelete = computed(() => crud.getPermission("delete"))
const buttonSize = computed(() => style.size)
const selectionEmpty = computed(() => crud.selection.length === 0)
const fallbackLabel = computed(() => crud.dict?.label?.delete ?? "删除")

function handleDelete() {
  void crud.rowDelete(...crud.selection)
}
</script>
