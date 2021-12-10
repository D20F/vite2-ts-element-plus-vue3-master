<template>
  <div
    :class="{ fullscreen: fullscreen }"
    class="tinymce-container"
    :style="{ width: containerWidth }"
  >
    <textarea :id="tinymceId" class="tinymce-textarea" />
    <div class="editor-custom-btn-container">
      <editorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK"  />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
import editorImage from './components/EditorImage'
import plugins from './plugins'
import toolbar from './toolbar'
import load from './dynamicLoadScript'

// why use this cdn, detail see https://github.com/PanJiaChen/tinymce-all-in-one
const tinymceCDN = 'https://cdn.jsdelivr.net/npm/tinymce-all-in-one@4.9.3/tinymce.min.js'
const props = defineProps({
  id: {
    type: String,
    default: function () {
      return 'vue-tinymce-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
    }
  },
  value: {
    type: String,
    default: ''
  },
  toolbar: {
    type: Array,
    required: false,
    default() {
      return []
    }
  },
  menubar: {
    type: String,
    default: 'file edit insert view format table'
  },
  height: {
    type: [Number, String],
    required: false,
    default: 360
  },
  width: {
    type: [Number, String],
    required: false,
    default: 'auto'
  }
})
let state = reactive({
  hasChange: false,
  hasInit: false,
  tinymceId: props.id,
  fullscreen: false,
  languageTypeList: {
    'en': 'en',
    'zh': 'zh_CN',
    'es': 'es_MX',
    'ja': 'ja'
  }
})
let {hasChange,hasInit,tinymceId,fullscreen,languageTypeList}=toRefs(state)
let { proxy }: any = getCurrentInstance()
let containerWidth = computed(() => {
  const width = props.width
  if (/^[\d]+(\.[\d]+)?$/.test(width)) { // matches `100`, `'100'`
    return `${width}px`
  }
  return width
})
watch(props.value as any, (val) => {
  if (!state.hasChange && state.hasInit) {
    proxy.$nextTick(() =>
      window.tinymce.get(state.tinymceId).setContent(val || ''))
  }
})
onMounted(() => {
  init()
})
const init = () => {
  load(tinymceCDN, (err: any) => {
    if (err) {
      proxy.$message.error(err.message)
      return
    }
    initTinymce()
  })
}
const initTinymce = () => {
  window.tinymce.init({
    selector: `#${state.tinymceId}`,
    language: state.languageTypeList['zh'],
    height: props.height,
    body_class: 'panel-body ',
    object_resizing: false,
    toolbar: props.toolbar.length > 0 ? props.toolbar : toolbar,
    menubar: props.menubar,
    plugins: plugins,
    end_container_on_empty_block: true,
    powerpaste_word_import: 'clean',
    code_dialog_height: 450,
    code_dialog_width: 1000,
    advlist_bullet_styles: 'square',
    advlist_number_styles: 'default',
    imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
    default_link_target: '_blank',
    link_title: false,
    nonbreaking_force_tab: true, // inserting nonbreaking space &nbsp; need Nonbreaking Space Plugin
    init_instance_callback: (editor: any) => {
      if (props.value) {
        editor.setContent(props.value)
      }
      state.hasInit = true
      editor.on('NodeChange Change KeyUp SetContent', () => {
        state.hasChange = true
        proxy.$emit('input', editor.getContent())
      })
    },
    setup(editor: any) {
      editor.on('FullscreenStateChanged', (e) => {
        state.fullscreen = e.state
      })
    },
    convert_urls: false
  })
}
const destroyTinymce = () => {
  const tinymce = window.tinymce.get(state.tinymceId)
  if (state.fullscreen) {
    tinymce.execCommand('mceFullScreen')
  }
  if (tinymce) {
    tinymce.destroy()
  }
}
const setContent = (value: any) => {
  window.tinymce.get(state.tinymceId).setContent(value)
}
const getContent = () => {
  window.tinymce.get(state.tinymceId).getContent()
}
const imageSuccessCBK = (arr: any) => {
  arr.forEach(v => {
    window.tinymce.get(state.tinymceId).insertContent(`<img class="wscnph" src="${v.url}" >`)
  })
}
</script>
<style scoped>
 :deep(#mceu_44-body) {
   white-space: pre-wrap!important;
   
}
:deep(#mceu_46-body){
     white-space: pre-wrap!important;
}
  :deep( .mce-container, .mce-container *, .mce-widget, .mce-widget *, .mce-reset){
   white-space: pre-wrap!important;
  width: 100%!important;
}
:deep(.mce-flow-layout) {
 white-space: pre-wrap!important;
}

 :deep(.mce-widget){
  white-space: pre-wrap!important;
   }
:deep(.mce-ico ) {
  font-size: 1rem!important;
}
.tinymce-container {
  position: relative;
  line-height: normal;
}
:deep(.tinymce-container .mce-fullscreen) {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
