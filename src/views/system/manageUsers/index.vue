<template>
    <div class="manageUsers">
        <el-form :inline="true" :model="headerForm" class="demo-form-inline">
            <el-form-item label="姓名">
                <el-input v-model="headerForm.name" placeholder="姓名"></el-input>
            </el-form-item>
            <el-form-item label="用户组">
                <el-select v-model="headerForm.grounp" placeholder="用户组">
                    <el-option
                        v-for="(item, index) of grounp"
                        :key="index"
                        :label="item.label"
                        :value="item.label"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button
                    @click="
                        headerForm = {
                            name: '',
                            grounp: '',
                        }
                    "
                    type="primary"
                >全部</el-button>
            </el-form-item>
        </el-form>

        <el-button type="primary" @click="dialogFormVisible = true">新增人员</el-button>
        <el-table :data="tableData" v-loading="tableDataLoading" style="width: 100%;margin-top:30px" border >
            <el-table-column prop="username" label="账号" width="180" />
            <el-table-column prop="name" label="姓名" width="180" />
            <el-table-column prop="adminRole.roleName" label="用户组" width="180" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-tooltip
                        class="item"
                        effect="dark"
                        content="重置密码为 123456"
                        placement="top"
                        style="margin: 0 10px"
                    >
                        <el-popconfirm
                            @confirm="handleRest(scope.row.id)"
                            confirmButtonText="确认"
                            cancelButtonText="取消"
                            icon="el-icon-info"
                            title="确定重置吗？"
                        >
                            <template #reference>
                                <el-button size="mini">重置</el-button>
                            </template>
                        </el-popconfirm>
                    </el-tooltip>
                    <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            layout="prev, pager, next"
            v-model:total="page.total"
            v-model:page-size="page.pageSize"
            v-model:currentPage="page.page"
            @current-change="currentChange"
            @size-change="handleSizeChange"
            :hide-on-single-page="true"
        ></el-pagination>
        <el-dialog title="新增人员" @close="dialogClose" v-model="dialogFormVisible">
            <el-form :model="form">
                <el-form-item label="用户组" label-width="70px">
                    <el-select @change="addSelect" v-model="form.roleName" placeholder="用户组">
                        <el-option
                            v-for="(item, index) of grounp"
                            :key="index"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="账号" label-width="70px">
                    <el-input v-model="form.username" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="密码" label-width="70px">
                    <el-input
                        type="password"
                        v-model="form.password"
                        autocomplete="off"
                        minlength="6"
                    ></el-input>
                </el-form-item>
                <el-form-item label="确认密码" label-width="70px">
                    <el-input
                        type="password"
                        v-model="form.passwords"
                        autocomplete="off"
                        minlength="6"
                    ></el-input>
                </el-form-item>
                <el-form-item label="姓名" label-width="70px">
                    <el-input v-model="form.name" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <template #footer class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </template>
        </el-dialog>

        <el-dialog title="编辑人员" @close="dialogClose" v-model="dialogFormEdit">
            <el-form :model="formEdit">
                <el-form-item label="用户组" label-width="70px">
                    <el-select @change="EditSelect" v-model="formEdit.roleName" placeholder="用户组">
                        <el-option
                            v-for="(item, index) of grounp"
                            :key="index"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="姓名" label-width="70px">
                    <el-input v-model="formEdit.name" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <template #footer class="dialog-footer">
                <el-button @click="dialogFormEdit = false">取 消</el-button>
                <el-button type="primary" @click="EditUser">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
import {
    adminRoleAllA,
    adminUserPageA,
    adminUserModifyS,
    adminUserPasswordResetS,
    adminUserDeleteS,
    adminUserAddS,
} from "@/api/authority";
let { proxy }: any = getCurrentInstance()
let state = reactive({
    headerForm: {
        name: "",
        grounp: "",
    },
    tableCacheData: [],
    dialogFormVisible: false,
    tableDataLoading: true,

    dialogFormEdit: false,
    form: {
        name: "",
        password: "",
        roleId: 0,
        username: "",
        passwords: "",
        roleName: "",
    },
    formEdit: {
        roleName: "",
        name: "",
        id: "",
        roleId: "",
    },
    grounp: [],
    page: {
        total: 0,
        page: 1,
        pageSize: 10,
    },

})
const handleSizeChange = (v) => {
    console.log(v)
}
let tableData = computed(() => {
    let data = state.tableCacheData
    data = state.tableCacheData.filter((data) =>
        !state.headerForm.name ||
        data.name
            .toLowerCase()
            .includes(state.headerForm.name.toLowerCase())
    )
    data = data.filter((data) =>
        data.adminRole.roleName
            .toLowerCase()
            .includes(state.headerForm.grounp.toLowerCase())
    )
    return data;
});

onMounted(() => {
    adminRoleAllAS();
    adminUserPageS();
});

const adminRoleAllAS = () => {
    adminRoleAllA({}).then((res: any) => {
        let arr = [];
        for (const item of res.data) {
            arr.push({
                label: item.roleName,
                value: item.id,
            });
        }
        state.grounp = arr;
    });
}
const adminUserPageS = () => {
    let data = {
        current: state.page.page,
        size: state.page.pageSize,
    };
    adminUserPageA(data).then((res: any) => {
        state.tableCacheData = res.records;
        state.page.total = res.total;
        state.tableDataLoading = false;
    });
}
const EditUser = () => {
    let data = {
        name: state.formEdit.name,
        roleId: state.formEdit.roleId,
    };
    adminUserModifyS(state.formEdit.id, data).then((res) => {
        proxy.$message({
            message: "修改用户成功",
            type: "success",
        });
        state.dialogFormEdit = false;
    });
}
const dialogClose = () => {
    adminUserPageS();
    state.form = {
        name: "",
        password: "",
        roleId: 0,
        username: "",
        passwords: "",
        roleName: "",
    };
}
const EditSelect = (data: any) => {
    state.formEdit.roleId = data;
}
const addSelect = (data: any) => {
    state.form.roleId = data;
}
const handleEdit = (row: any) => {
    state.dialogFormEdit = true;
    state.formEdit = {
        roleName: row.adminRole.roleName,
        name: row.name,
        id: row.id,
        roleId: row.roleId,
    };
}
const handleDelete = (row: any) => {
    adminUserDeleteS(row).then((res) => {
        proxy.$message({
            message: "删除用户成功",
            type: "success",
        });
        adminUserPageS();
    });
}
const handleRest = (row: any) => {
    console.log(row)
    adminUserPasswordResetS(row).then((res: any) => {
        proxy.$message({
            message: "重置用户密码成功",
            type: "success",
        });
    });
}
const confirm = () => {
    if (state.form.password !== state.form.passwords) {
        proxy.$message({
            message: "用户密码错误",
            type: "error",
        });
    }
    let data = {
        name: state.form.name,
        roleId: state.form.roleId,
        password: state.form.password,
        username: state.form.username,
    };
    adminUserAddS(data).then((res: any) => {
        proxy.$message({
            message: "创建用户成功",
            type: "success",
        });
        state.dialogFormVisible = false;
    });
}
const currentChange = (v: any) => {
    state.page.page = v;
    adminUserPageS();

}
let { page, grounp, formEdit, form, dialogFormEdit, tableDataLoading, dialogFormVisible, tableCacheData, headerForm } = toRefs(state)
</script>
<style lang="sss" scoped>

</style>