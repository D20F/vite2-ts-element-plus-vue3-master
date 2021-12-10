<template>
    <div class="upload-container">
        <el-button
            :style="{ background: color, borderColor: color }"
           
            size="mini"
            type="primary"
            @click="dialogVisible = true"
        >上传</el-button>
        <el-dialog :modal="false" v-model="dialogVisible">
            <el-upload
                :multiple="true"
                :file-list="fileList"
                :show-file-list="true"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
                class="editor-slide-upload"
                list-type="picture-card"
                action="https://sxngapi.whkxzj.com/sxngApi/upload/file"
            >
                <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
const props = defineProps({
    color: {
        type: String,
        default: "#1890ff",
    },
})
let state = reactive({
    dialogVisible: false,
    listObj: {},
    fileList: []
})
let { dialogVisible, listObj, fileList } = toRefs(state)
let { proxy }: any = getCurrentInstance()

const checkAllSuccess = () => {
    return Object.keys(state.listObj).every(
        (item) => state.listObj[item].hasSuccess
    );
}
const handleSubmit = () => {
    const arr = Object.keys(state.listObj).map((v) => state.listObj[v]);
    if (!checkAllSuccess()) {
        proxy.$message(
            "Please wait for all images to be uploaded successfully. If there is a network problem, please refresh the page and upload again!"
        );
        return;
    }
    proxy.$emit("successCBK", arr);
    state.listObj = {};
    state.fileList = [];
    state.dialogVisible = false;
}
const handleSuccess = (response: any, file: any) => {
    const uid = file.uid;
    const objKeyArr = Object.keys(state.listObj);
    for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (state.listObj[objKeyArr[i]].uid === uid) {
            // this.listObj[objKeyArr[i]].url = response.files.file;
            state.listObj[objKeyArr[i]].url = response.data;
            state.listObj[objKeyArr[i]].hasSuccess = true;
            return;
        }
    }
}
const handleRemove=(file:any)=>{
       const uid = file.uid;
            const objKeyArr = Object.keys(state.listObj);
            for (let i = 0, len = objKeyArr.length; i < len; i++) {
                if (state.listObj[objKeyArr[i]].uid === uid) {
                    delete state.listObj[objKeyArr[i]];
                    return;
                }
            }
}
const beforeUpload=(file:any)=>{
            const _URL = window.URL || window.webkitURL;
            const fileName = file.uid;
            state.listObj[fileName] = {};
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = _URL.createObjectURL(file);
                img.onload = function () {
                    state.listObj[fileName] = {
                        hasSuccess: false,
                        uid: file.uid,
                        width: proxy.width,
                        height: proxy.height,
                    };
                };
                resolve(true);
            });
}
</script>

<style lang="scss" scoped>
.editor-slide-upload {
    margin-bottom: 20px;
    .el-upload--picture-card {
        width: 100%;
    }
}
</style>
