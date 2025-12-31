<template>
  <RouterView />
  <AlertModal />
  <Toast />
</template>

<script setup>
import AlertModal from './components/ui/AlertModal.vue';
import Toast from './components/Toast.vue';
</script>
