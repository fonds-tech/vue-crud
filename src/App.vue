<template>
  <div style="padding: 20px">
    <h1>Component Playground</h1>
    <div style="margin-bottom: 20px">
      <h3>Add Button</h3>
      <add-button />
    </div>
    <div style="margin-bottom: 20px">
      <h3>Delete Button</h3>
      <p>Select items to enable delete button</p>
      <button @click="toggleSelection">
        Toggle Selection
      </button>
      <delete-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import AddButton from "./components/add-button"
import DeleteButton from "./components/delete-button"
import { provide, reactive } from "vue"

const mockCrud = reactive({
  selection: [],
  getPermission: () => true,
  rowAdd: () => console.log("Row Add Clicked"),
  rowDelete: (...args: any[]) => console.log("Row Delete Clicked", args),
  dict: {
    label: {
      add: "Add",
      delete: "Delete",
    },
  },
})

const mockConfig = {
  style: {
    size: "default",
  },
}

provide("crud", mockCrud)
provide("mitt", { emit: () => {}, on: () => {}, off: () => {} })
provide("__crud_config__", mockConfig)

function toggleSelection() {
  mockCrud.selection = mockCrud.selection.length ? [] : [{ id: 1 }]
}
</script>
