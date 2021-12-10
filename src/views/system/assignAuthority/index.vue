<template>
    <div class="assignAuthority">
        <div class="left">
            <div class="header">
                <el-input placeholder="输入关键字进行过滤" v-model="filterText" />
                <el-button @click="open()" type="primary">新增顶层菜单</el-button>
            </div>
            <el-tree
                ref="tree2"
                :data="trees"
                node-key="id"
                highlight-current
                :props="defaultProps"
                :filter-method="filterNode"
                :default-checked-keys="defaultSelect"
                @current-change="currentChange"
            >
                <template #default="{ node, data }">
                    <svg-icon v-if="data.type === 2" icon-class="operation"></svg-icon>
                    <svg-icon
                        v-else-if="data.type === 1"
                        :icon-class="data.icon"
                        style="font-size:15px"
                    ></svg-icon>
                    <span>{{ node.label }}</span>
                    <span v-if="node.label == form.name">
                        <el-button
                            v-if="data.type === 1"
                            type="text"
                            size="mini"
                            style="margin-left: 10px;"
                            @click.stop="append(data)"
                        >新增</el-button>
                        <el-button type="text" size="mini" @click.stop="remove(data)">删除</el-button>
                    </span>
                </template>
            </el-tree>
        </div>
        <div class="right">
            <el-form :model="form" ref="forms">
                <el-form-item label="上级菜单" label-width="70px">
                    <el-input :disabled="true" v-model="form.supName" autocomplete="off"></el-input>
                </el-form-item>
                <div v-if="form.type == 1">
                    <el-form-item label="path" label-width="70px">
                        <el-input v-model="form.path" autocomplete="off"></el-input>
                    </el-form-item>
                </div>
                <el-form-item label="名称" label-width="70px">
                    <el-input v-model="form.name" autocomplete="off"></el-input>
                </el-form-item>
                <div v-if="form.type == 1">
                    <el-form-item label="选择图标" label-width="70px">
                        <div style="display: flex">
                            <IconPicker @input="input" />
                            <el-input :disabled="false" v-model="form.icon" autocomplete="off"></el-input>
                        </div>
                    </el-form-item>
                </div>
                <div v-else-if="form.type == 2">
                    <el-form-item label="按钮标识" label-width="70px">
                        <el-input v-model="form.identify" autocomplete="off"></el-input>
                    </el-form-item>
                </div>
                <el-form-item label="URL" label-width="70px">
                    <el-input v-model="form.component" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="隐藏" label-width="70px">
                    <el-switch v-model="form.hidden" active-value="1" inactive-value="0" active-color="#13ce66"></el-switch>
                </el-form-item>
                <el-form-item class="dialog-footer">
                    <el-button type="primary" @click.prevent="confirm()">确定</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-dialog title="新增" ref="dialog" v-model="dialogFormVisible" @close="close">
            <el-form :model="form">
                <el-form-item label="上级菜单" label-width="70px">
                    <el-input :disabled="true" v-model="form.supName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="名称" label-width="70px">
                    <el-input v-model="form.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="选择类型" label-width="70px">
                    <el-button type="primary" @click="form.type = 1">菜单</el-button>
                    <el-button type="success" @click="form.type = 2">按钮</el-button>
                </el-form-item>
                <el-form-item v-if="form.type == 1" label="path" label-width="70px">
                    <el-input v-model="form.path" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item v-show="form.type == 1" label="选择图标" label-width="70px">
                    <div style="display: flex">
                        <IconPicker @input="input" />
                        <el-input :disabled="false" v-model="form.icon" autocomplete="off"></el-input>
                    </div>
                </el-form-item>
                <el-form-item v-if="form.type == 2" label="按钮标识" label-width="70px">
                    <el-input v-model="form.identify" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="URL" label-width="70px">
                    <el-input v-model="form.component" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="隐藏" label-width="70px">
                    <el-switch v-model="form.hidden" active-value="1" inactive-value="0" active-color="#13ce66"></el-switch>
                </el-form-item>
            </el-form>
            <template #footer class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="dialogConfirm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script  setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
import IconPicker from "./component/iconPicker.vue";
import {
    adminPermissionPage,
    adminPermissionAdd,
    adminPermissionDelete,
    adminPermissionModify,
} from "@/api/user";
import { ObjTy } from '@/types/common';
let state = reactive({
    name: 'assignAuthority',
    trees: [],
    defaultProps: {
        children: 'children',
        label: 'name',
        type: 'type',
        class: (data: any) => {
            let daDs = JSON.parse(JSON.stringify(data))
        }
    },
    filterText: "",
    form: {
        supName: "",
        children: [],
        id: "",
        component: "",
        path: "", // 路径
        name: "", //
        type: 0, // 1页面 2按钮
        pid: 0, //pid
        sequence: 0, // 排序
        title: "",
        icon: "",
        identify: "",
        hidden: 0
    }
})
const tree2: any = ref(null)
let dialogFormVisible = ref(false);
let { proxy }: any = getCurrentInstance()
const input = (data: any) => {
    state.form.icon = data
}
let defaultSelect = ref([]);
watch(
    () => state.filterText,
    (val) => {
        tree2.value.filter(val)
    },
    { immediate: false }
)
const adminPermissionPageA = () => {
    adminPermissionPage().then((res: any) => {
        state.trees = JSON.parse(JSON.stringify(res.data))
    })
}
const open = () => {
    dialogFormVisible.value = true
    for (const item in state.form) {
        if (item == "sequence") {
            state.form.sequence = state.tree.length + 1;
        } else if (item == "pid") {
            state.form.pid = 0
        } else if (item == "children") {
            state.form.children = []
        }
        else if (item == "type") {
            state.form.type = 1;
        } else {
            state.form[item] = "";
        }
    }
}
const clear = () => {
    for (const item in form) {
        state.form[item] = "";
    }
}

const confirm = () => {
    state.form.title = state.form.name
    adminPermissionModify(state.form.id, state.form).then((res: any) => {
        adminPermissionPageA()
        clear();
    });
}
const dialogConfirm = () => {
    console.log(form);
    if (state.form.pid == 0) {
        state.form.component = "Layout"
    }
    state.form.title = state.form.name
    adminPermissionAdd(state.form).then((res: any) => {
        adminPermissionPageA();
        clear();
        dialogFormVisible.value = false;
    });
}
const append = (v: any) => {
    let data = JSON.parse(JSON.stringify(v));
    for (const item in state.form) {
        state.form[item] = "";
    }
    state.form.children = []
    state.form.supName = data.name;
    state.form.id = ""
    state.form.pid = data.id;
    // form.name = data.name;
    state.form.type = 1;
    dialogFormVisible.value = true;
}
const close = () => {
    dialogFormVisible.value = false
}
const remove = (data: any) => {
    adminPermissionDelete(data.id).then(() => {
        adminPermissionPageA()
    })
}
const filterNode = (value: string, data: ObjTy) => {
    if (!value) return true;
    return data.name.indexOf(value) !== -1;
}
onMounted(() => {
    adminPermissionPageA()
})
const currentChange = (v: any) => {
    state.form = JSON.parse(JSON.stringify(v));
    state.form.hidden=state.form.hidden+""
}
let { name, trees, defaultProps, filterText, form } = toRefs(state)

</script>

<style lang="scss" scoped>
.assignAuthority {
    display: flex;
    justify-content: space-around;
    width: 100%;
}
.left {
    width: 40%;
    .header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
.right {
    width: 40%;
}
.custom-tree-node {
    span:nth-child(2) {
        margin: 0 8px;
    }
}
</style>
