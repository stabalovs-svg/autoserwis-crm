<script setup>
import { ref } from 'vue'

const props = defineProps({
  photos: { type: Array, default: () => [] },
  t: { type: Function, required: true },
  busy: { type: Boolean, default: false },
  tag: { type: String, default: 'general' },
})
const emit = defineEmits(['add', 'remove', 'open', 'update:tag'])
const input = ref(null)

const tags = ['general', 'before', 'after', 'damage', 'part']

function pick(event) {
  const files = [...(event.target.files || [])]
  if (files.length) emit('add', files)
  event.target.value = ''
}
</script>

<template>
  <div class="photo-block">
    <div class="photo-tags">
      <button v-for="item in tags" :key="item" type="button" :class="['chip', { active: tag === item }]" @click="emit('update:tag', item)">
        {{ t('tag' + item.charAt(0).toUpperCase() + item.slice(1)) }}
      </button>
    </div>

    <div class="photo-grid">
      <figure v-for="photo in props.photos" :key="photo.id" class="photo-card">
        <button type="button" class="photo-frame" :title="t('photoView')" @click="emit('open', photo)">
          <img :src="photo.thumbUrl" :alt="t('tag' + photo.tag.charAt(0).toUpperCase() + photo.tag.slice(1))" loading="lazy">
        </button>
        <figcaption>
          <span>{{ t('tag' + photo.tag.charAt(0).toUpperCase() + photo.tag.slice(1)) }}</span>
          <em>{{ photo.time }}</em>
        </figcaption>
        <button type="button" class="photo-remove" :title="t('deletePhoto')" @click="emit('remove', photo)">×</button>
      </figure>

      <button type="button" class="photo-add" :disabled="busy" @click="input.click()">
        <b>📷</b>
        <span>{{ busy ? t('photoSaving') : t('addPhoto') }}</span>
      </button>
    </div>

    <input ref="input" class="photo-input" type="file" accept="image/*" capture="environment" multiple @change="pick">
  </div>
</template>
