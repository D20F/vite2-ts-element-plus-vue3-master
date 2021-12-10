<template>
    <el-upload
        class="upload-demo"
        list-type="picture"
        :auto-upload="false"
        :on-change="onChange"
        :on-remove="onRemove"
        :limit="limit"
        :file-list="fileList"
        action="abcdefg"
    >
        <el-button size="small" type="primary">选取文件</el-button>
    </el-upload>
</template>
<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { uploadImage } from '@/api/other'
const props = defineProps({
    limit: {
        type: Number,
        default: 1,
    },
    autoUpload: {
        type: Boolean,
        default: false,
    },
    fileList: {
        type: Array,
        default: () => {
            return [
            ];
        },
    },
})
let state = reactive({
    uploadList: []
})
let { uploadList } = toRefs(state)
let { proxy }: any = getCurrentInstance()
const confirm = () => {
    if (state.uploadList.length == 0) {
        return proxy.$emit("uploadSuccess", []);
    }
    // 选择了新的图片 或 删除了图片选择了新的图片
    // 替换掉已经成功上传的图片 之后再和上传完的合并
    let successList: any = [];
    for (let i = 0; i < state.uploadList.length; i++) {
        if (state.uploadList[i].status == "success") {
            successList.push(state.uploadList[i].url);
            state.uploadList.splice(i, 1);
            i--;
        }
    }
    let form = new FormData();
    for (const item of state.uploadList) {
        let fileType = item.raw.type,
            isImage = fileType.indexOf("image") != -1,
            isLt2M = item.size / 1024 / 1024 < 2;
        // 这里常规检验，看项目需求而定
        if (!isImage) {
            proxy.$message.error("只能上传图片格式png、jpg、gif!");
            return;
        }

        form.append("images", item.raw);
    }
    uploadImage(form).then((res) => {
        proxy.$emit("uploadSuccess", [...res, ...successList]);
    });
}
const onChange = (file: any, fileList: any) => {
    console.log(fileList);
    state.uploadList = fileList;
    if (props.autoUpload) {
        confirm();
    }
}
const onRemove = (file: any, fileList: any) => {
    state.uploadList = fileList;
    if (props.autoUpload) {
        confirm();
    }
}
</script>