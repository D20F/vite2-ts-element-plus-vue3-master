<template>
    <div>
        <el-button
            type="primary"
            size="medium"
            v-permission="['group_add']"
            @click=";(dialogFormVisible = true), (form.mode = 'add')"
        >
            新增用户组
        </el-button>

        <el-table :data="tableData" v-loading="tableDataLoading" style="width: 100%; margin-top: 30px" border>
            <el-table-column prop="roleName" label="名称" width="180" align="center" />
            <el-table-column label="备注" prop="roleDescribe" width="180" align="center" />
            <el-table-column label="创建时间" prop="createTime" align="center" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="mini" @click="handleEdit(scope.row)" v-permission="['group_edit']">编辑</el-button>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.row)" v-permission="['group_del']">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination
            class="pagination"
            background
            layout="prev,pager,next"
            :total="pagination.total"
            v-model:page-size="pagination.pageSize"
            v-model:current-page="pagination.page"
            @current-change="currentChange"
            hide-on-single-page
        ></el-pagination>

        <el-dialog title="权限配置" v-model="dialogFormVisible" @close="dialogClose">
            <el-button type="primary" @click="setCheckedKeys(getTreeKey())" size="mini" round>全选</el-button>
            <el-button type="success" @click="setCheckedKeys([])" size="mini" round>清空</el-button>
            <el-input style="margin: 10px 0" placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
            <el-tree
                :data="tree"
                ref="tree2"
                show-checkbox
                node-key="id"
                highlight-current
                :props="defaultProps"
                :filter-method="filterNode"
                :default-checked-keys="defaultSelect"
                check-strictly
            ></el-tree>
            <el-form :model="form">
                <el-form-item label="名称" label-width="40px">
                    <el-input v-model="form.roleName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" label-width="40px">
                    <el-input v-model="form.roleDescribe" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="confirm">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
 
<script  setup lang="ts" >
import { ref, reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
import { adminPermissionPage } from '@/api/user'
import { adminRoleAdd, adminRoleModify, adminRoleAllA, adminRoleDelete } from '@/api/authority'
let { proxy }: any = getCurrentInstance()
interface tableItem {
    [key: string]: any
}
interface treeItem {
    [key: string]: any
}
interface formItem {
    roleName: string
    roleDescribe: string
    mode: string
    id: string
}
let state = reactive({
    dialogFormVisible: false,
    tableData: [],
    tree: [],
    tableDataLoading: false,
    filterText: '',
    defaultSelect: [],
    form: {
        roleName: '',
        roleDescribe: '',
        mode: '',
        id: ''
    },
    defaultProps: {
        children: 'children',
        label: 'name'
    },
    pagination: {
        total: 0,
        page: 1,
        pageSize: 10
    }
})
const tree2 = ref(null)
const handleEdit = <T extends tableItem>(row: T) => {
    state.dialogFormVisible = true
    proxy.$nextTick(() => {
        setCheckedKeys(row.list)
    })
    state.form = {
        roleName: row.roleName,
        roleDescribe: row.roleDescribe,
        mode: 'edit',
        id: row.id
    }
}
const handleDelete = <T extends tableItem>(row: T) => {
    adminRoleDelete(row.id).then((res: any) => {
        proxy.$message({
            message: '删除用户组成功',
            type: 'success'
        })
        adminRoleAllAs()
    })
}

const currentChange = (v: any) => {
    state.pagination.page = v
}
const adminPermissionPageA = () => {
    adminPermissionPage().then((res: any) => {
        state.tree = JSON.parse(JSON.stringify(res.data))
    })
}
onMounted(() => {
    adminPermissionPageA()
    adminRoleAllAs()
})
const adminRoleAllAs = () => {
    let data = {
        current: state.pagination.page,
        size: state.pagination.pageSize
    }
    adminRoleAllA(data).then((res: any) => {
        state.tableData = JSON.parse(JSON.stringify(res.data))
        state.pagination.total = res.total
        state.tableDataLoading = false
    })
}
const dialogClose = () => {
    let form_in: any = state.form
    for (let key in form_in) {
        form_in[key] = ''
    }
    state.form = form_in
    state.dialogFormVisible = false
}
const filterNode = (value: any, data: any) => {
    if (!value) return true
    return data.name.indexOf(value) !== -1
}
// 获取 tree 所有key
const getTreeKey = () => {
    let key: any = []
    let parseArr = (data: any) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].children instanceof Array) {
                parseArr(data[i].children)
                key.push(data[i].id)
            } else {
                key.push(data[i].id)
            }
        }
    }
    parseArr(state.tree)
    return key
}
// 设置tree 选中
const setCheckedKeys = (data: any) => {
    console.log(data)
    proxy.$refs.tree2.setCheckedKeys(data)
}

const confirm = () => {
    if (state.form.mode == 'add') {
        let key: any = []
        key = proxy.$refs.tree2.getCheckedKeys().concat(proxy.$refs.tree2.getHalfCheckedKeys())
        let data = {
            list: key,
            roleName: state.form.roleName,
            roleDescribe: state.form.roleDescribe
        }
        adminRoleAdd(data).then((res: any) => {
            proxy.$message({
                message: '创建用户组成功',
                type: 'success'
            })
            adminRoleAllAs()
            state.dialogFormVisible = false
        })
    } else if (state.form.mode == 'edit') {
        let key = []
        key = proxy.$refs.tree2.getCheckedKeys().concat(proxy.$refs.tree2.getHalfCheckedKeys())
        let data = {
            list: key,
            roleName: state.form.roleName,
            roleDescribe: state.form.roleDescribe
        }
        adminRoleModify(state.form.id, data).then((res: any) => {
            proxy.$message({
                message: '修改用户组成功',
                type: 'success'
            })
            adminRoleAllAs()
            state.dialogFormVisible = false
        })
    }
}

let {
    dialogFormVisible,
    form,
    pagination,
    defaultProps,
    defaultSelect,
    filterText,
    tableDataLoading,
    tree,
    tableData
} = toRefs(state)
</script>
