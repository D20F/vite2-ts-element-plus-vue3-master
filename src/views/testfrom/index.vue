<template>
    <tablefrom
        ref="tableForm"
        :is-search="isSearch"
        :is-edit="isEdit"
        :is-page="isPage"
        :is-delete="true"
        :form-data="formData"
        :modal-config="modalConfig"
        :table-config="tableConfig"
        :get-data="getData"
        :handle-add-data="handleAddData"
        :handle-delete="handleDelete"
    >
        <template #header="{ addClick, _getData }">
            <el-row :gutter="10" type="flex" align="middle">
                <el-col :span="1.4">
                    <span>姓名</span>
                </el-col>
                <el-col :span="3">
                    <el-input v-model="headerForm.name" placeholder="姓名"></el-input>
                </el-col>
                <el-col :span="1.4">
                    <span>用户组</span>
                </el-col>
                <el-col :span="3">
                    <el-select v-model="headerForm.grounp" placeholder="用户组">
                        <el-option
                            v-for="(item, index) of seletAll"
                            :key="index"
                            :label="item.label"
                            :value="item.label"
                        ></el-option>
                    </el-select>
                </el-col>
                <el-col :span="1">
                    <el-button type="primary" @click="_getData">查询</el-button>
                </el-col>
                <el-col :span="1">
                    <el-button type="primary" @click="addClick">新增</el-button>
                </el-col>
                <el-col :span="1">
                    <el-button type="primary">
                        <router-link :to="{ path: '/system/userGroup' }"></router-link>跳转
                    </el-button>
                </el-col>
            </el-row>
        </template>
    </tablefrom>
    <el-form v-model="froms">
        <el-form-item>
            <!-- <Editor v-model="froms.content" height="500px" /> -->
        </el-form-item>
        <el-form-item>
            <el-button @click.stop="wan">获取</el-button>
        </el-form-item>
    </el-form>
</template>
<script setup lang="ts">
import tablefrom from '@/components/tablefrom/index.vue'
import Editor from '@/components/Editor/richEditor.vue';
import { adminUserPageA, adminRoleAllA, adminUserAddS } from '@/api/authority'
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
let state = reactive({
    froms: {
        content: "",
    },
    isSearch: false,
    isEdit: true,
    isPage: false,
    seletAll: [],
    img: "",
    headerForm: {
        name: "",
        grounp: "",
    },
    modalConfig: [{
        attribute: 'roleName',
        label: '用户组',
        type: 'select',
        selectList: []
    }, {
        attribute: 'uploadImage',
        label: '照片',
        type: 'uploadImage',
        uploadSuccess: (data: any) => {
            updataimage(data)
        }
    },
    {
        attribute: 'video',
        label: '照片',
        type: 'video',
        uploadSuccess: (data: any) => {
            console.log(data);
        }
    },
    {
        attribute: 'Editor',
        label: '富文本',
        type: 'Editor',
    },
    {
        attribute: 'username',
        label: '账户',
        type: 'input',
    }, {
        attribute: 'password',
        label: '密码',
        type: 'input',
    }, {
        attribute: 'passwords',
        label: '确认密码',
        type: 'input',
    }, {
        attribute: 'name',
        label: '姓名',
        type: 'input',
    },
    ],
    tableConfig: [
        { attribute: 'username', label: '账户' },
        { attribute: 'name', label: '姓名' },

        {
            attribute: 'adminRole', label: '用户组', type: 'handle',
            handleFunc: (adminRole: any, item: any, row: any) => {
                return adminRole.roleName
            }
        },
        { attribute: 'createTime', label: '时间' }
    ]
})
let { isSearch, isEdit, isPage, modalConfig, tableConfig, headerForm, seletAll, froms } = toRefs(state)
let formData = () => ({ roleName: '', username: '', password: '', passwords: '', name: '', uploadImage: "", Editor: "" })
let { proxy }: any = getCurrentInstance()
let getselect = () => {

}
const wan = () => {
    console.log(1111, state.froms);
}
const harf = () => {

}
const updataimage = (data: any) => {
    state.img = data[0]
}
const getData = (obj = { pageNum: 1, pageSize: 10 }) => {
    return new Promise((resolve, reject) => {
        adminUserPageA({ ...obj, ...state.headerForm }).then((res: any) => {
            resolve({
                tableData: res.records,
                tableDataTotal: res.total
            });
        });
    });
    // adminUserPageA({}).then((res:any) => {
    //    tableConfig.value =res.records
    //     console.log(res)
    // })
}
const handleAddData = (data: any) => {
    return new Promise((resolve, reject) => {
        console.log(data);
        data = {
            name: data.name,
            roleId: data.roleName,
            password: data.password,
            username: data.username,
            imag: state.img
        }
        adminUserAddS(data).then((res: any) => {
            resolve(res);
        });
    });
    // adminUserAddS(data).then((res: any) => {
    //         proxy.$message({
    //             message: "创建用户成功",
    //             type: "success",
    //         });
    //         state.dialogFormVisible = false;
    //     });
}
const handleDelete = () => {

}
onMounted(() => {
    adminRoleAllS();
})
const adminRoleAllS = () => {
    adminRoleAllA({}).then((res: any) => {
        let arr = [];
        for (const item of res.data) {
            arr.push({
                label: item.roleName,
                value: item.id,
            });
        }
        state.seletAll = arr
        state.modalConfig.forEach((res) => {
            if (res.attribute == 'roleName') {
                res.selectList = arr
            }

        })
    })
}
</script>

