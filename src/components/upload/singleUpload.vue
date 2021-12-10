<template>
  <div>
    <el-upload
      :action="dataObj.host"
      :data="dataObj"
      list-type="picture"
      :multiple="false"
      :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
    >
      <el-button size="small" type="primary">点击上传</el-button>
      <template #tip class="el-upload__tip">只能上传jpg/png文件，且不超过10MB</template>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="fileList[0].url"  />
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref } from 'vue'
let state = reactive({
  name: 'SingleUpload'
})
const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  dir: {
    type: String,
    default: ''
  },
  ratio: {
    type: Number,
    default: null
  },
  needRatio: {
    type: Boolean,
    default: false
  }
})
let { proxy }: any = getCurrentInstance()
let dataObj = reactive({
  key: null,
  policy: null,
  OSSAccessKeyId: null,
  signature: null,
  dir: null,
  host: null
})
let dialogVisible = ref(false)
let imageUrl = computed(() => {
  return props.value;
})
let imageName = computed(() => {
  if (props.value != null && props.value !== '') {
    return props.value.substr(props.value.lastIndexOf('/') + 1);
  } else {
    return null;
  }
})
let fileList: any = computed(() => {
  return [
    {
      name: imageName,
      url: imageUrl
    }
  ];
})
let showFileList = computed({
  get() {
    return (
      props.value !== null && props.value !== '' && props.value !== undefined
    );
  },
  set() {
  }
})
const beforeUpload = async (file: any) => {
  if (props.needRatio && props.ratio === null) {
    proxy.$message.error('需要传入上传图片的长宽比~');
    return false;
  }
  const isSize = props.ratio === null || (await judgeSize(file));

}
const judgeSize = (file: any) => {
  return new Promise((resolve) => {
    let _URL = window.URL || window.webkitURL;
    let img = new Image();
    img.src = _URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      const valid = ratio - props.ratio < 0.2 && ratio - props.ratio > -0.2;
      if (valid) {
        resolve(true);
      } else {
        proxy.$message.error(
          `设定长宽比${proxy.ratio.toFixed(2)},上传图片长宽比${ratio.toFixed(
            2
          )},不符合要求~`
        );
        resolve(false);
      }
    };
  })
}

const handleUploadSuccess = (res: any, file: any) => {
  console.log(file);
  console.log('上传成功...');
  showFileList.value = true;
  fileList.pop();
  fileList.push({
    name: file.name,
    url: dataObj.host + '/' + dataObj.key?.replace('${filename}', file.name)
  });
  emitInput(fileList[0].url);
}
const emitInput = (val: any) => {
  proxy.$emit('input', val);
}
const handleRemove = () => {
  emitInput('');
}
const handlePreview = () => {
  dialogVisible.value = true
}
const getUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    return (
      c === 'x' ? (Math.random() * 16) | 0 : 'r&0x3'as string | '0x8'
    ).toString(16);
  });
}

//导出属性到页面中使用
let { name } = toRefs(state)
</script>


