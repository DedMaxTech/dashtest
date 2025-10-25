<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
definePageMeta({ layout: 'empty' })

const { login, loading, error } = useAuth()

const fields = ref<AuthFormField[]>([
  { name: 'email', type: 'text', label: 'Email' },
  { name: 'password', type: 'password', label: 'Пароль' }
])

const onSubmit = async (form: FormSubmitEvent<any>) => {
  try {
    await login(form.data.email, form.data.password)
    await navigateTo('/') // успех — в дэшборд
  } catch {
    // сообщение уже в store.error
  }
}
</script>

<template>
  <div class="min-h-screen grid place-items-center p-4">
    <UModal :dismissible="false" :open="true" :close="false">
      <template #body>
        <div class="p-6 w-[min(92vw,28rem)]">
          <UAuthForm
            title="Вход"
            :fields="fields"
            :loading="loading"
            class="max-w-md mx-auto"
            @submit="onSubmit"
            :submit="{ label: 'Войти через Сфера.Код' }"            
          />
          <UAlert
            v-if="error"
            class="mt-4"
            color="error"
            variant="subtle"
            title="Ошибка входа"
            :description="error"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>