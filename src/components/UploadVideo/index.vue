<template>
    <div>
        <el-upload
            class="upload-demo"
            ref="upload"
            :auto-upload="false"
            action="abcdefg"
            :on-change="onChange"
            :on-remove="onRemove"
            :limit="1"
        >
            <el-button size="small" type="primary">上传视频</el-button>
        </el-upload>
        <div class="video" v-if="datavi">
            <video :src="datavi" controls="controls"></video>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { uploadFile } from "@/api/other";
import { ElLoading } from 'element-plus'
const props = defineProps({
    autoUpload: {
        type: Boolean,
        default: true,
    },
})
let state = reactive({
    uploadList: [],
    datavi: ''
})
let { uploadList, datavi } = toRefs(state)
let { proxy }: any = getCurrentInstance()
const confirm = (file?: any, fileList?: any) => {
    // 未主动选择 不上传 直接用外面的url就好了
    if (state.uploadList.length == 0) {
        return proxy.$emit("uploadSuccess", "");
    }
    let loadingInstance = ElLoading.service({
        text: "上传中",
    });

    let form = new FormData();
    for (const item of state.uploadList) {
        form.append("file", item.raw);
    }
    uploadFile(form).then((res) => {
        proxy.$nextTick(() => {
            loadingInstance.close();
        });
        proxy.$emit("uploadSuccess", res);
        state.datavi = res
    });
}
const onChange = (file: any, fileList: any) => {
    state.uploadList = fileList;
    // console.log(fileList);
    // console.log(this.uploadList);
    if (props.autoUpload) {
        confirm();
    }
}
const onRemove = (file: any, fileList: any) => {
    state.uploadList = fileList;
    // console.log(fileList);
    // console.log(this.uploadList);
    if (props.autoUpload) {
        confirm();
    }
}
</script>
<style scoped>
.video {
    width: 100%;
    height: 300px;
}
.video video {
    width: 100%;
    height: 100%;
}
</style>
