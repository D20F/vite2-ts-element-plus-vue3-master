<template>
    <div>
        <el-card>
            <template #header>
                <slot
                    name="header"
                    :addClick="addClick"
                    :queryParams="queryParams"
                    :_getData="_getData"
                >
                    <el-input
                        v-if="isSearch"
                        v-model="queryParams.key"
                        style="width: 200px"
                        clearable
                        @clear="_getData"
                    >
                        <template #append>
                            <el-button icon="el-icon-search" @click="_getData" />
                        </template>
                    </el-input>
                    <el-button
                        style="margin-left: 20px !important"
                        type="primary"
                        :disabled="!!authRouter && !hasAuthority(`${authRouter}:add`)"
                        @click="addClick"
                    >新增</el-button>
                </slot>
            </template>
            <el-table
                v-loading="tableLoading"
                :data="tableData"
                style="width: 100%"
                border
                fit
                stripe
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="40" />
                <el-table-column
                    v-for="(item, index) in tableConfig"
                    :key="index"
                    :prop="item.attribute"
                    :label="item.label"
                    :show-overflow-tooltip="item.tooltip"
                    align="center"
                >
                    <template #default="scope">
                        <!-- 图片 -->
                        <el-image
                            v-if="item.type === 'img'"
                            style="width: 60px"
                            :src="scope.row[item.attribute]"
                            fit="fill"
                            :preview-src-list="[scope.row[item.attribute]]"
                        />
                        <!-- 处理 -->
                        <span v-else-if="item.type === 'handle'">
                            {{
                                item.handleFunc(scope.row[item.attribute], item, scope.row)
                            }}
                        </span>
                        <!-- 操作 -->
                        <el-button
                            v-else-if="item.type === 'operate'"
                            :type="item.buttonType"
                            :disabled="
                                !!authRouter &&
                                !!item.authority &&
                                !hasAuthority(`${authRouter}:${item.authority}`)
                            "
                            @click="item.operateFunc(scope.row)"
                        >
                            {{
                                item.label || item.handleFunc(scope.row[item.attribute], item, scope.row)
                            }}
                        </el-button>
                        <!-- 默认 -->
                        <span v-else>{{ scope.row[item.attribute] }}</span>
                        <div></div>
                        <el-tooltip
                            v-if="item.icon == 'el-icon-info'"
                            class="item"
                            effect="dark"
                            :content="item.remarkto"
                            placement="top-start"
                        >
                            <i class="el-icon-info"></i>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column width="200px" v-if="isEdit || isDelete" label="操作" align="center">
                    <template #default="scope">
                        <slot
                            name="handle"
                            :editClick="editClick"
                            :scope="scope"
                            :deleteClick="deleteClick"
                            :seeClick="seeClick"
                        >
                            <el-button v-if="isEdit" type="success" @click="editClick(scope.row)">修改</el-button>
                            <el-button
                                v-if="isDelete"
                                type="danger"
                                @click="deleteClick(scope.row)"
                            >删除</el-button>
                        </slot>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                v-if="isPage"
                :current-page="queryParams.pageNum"
                :page-size="queryParams.pageSize"
                :total="tableDataTotal"
                :page-sizes="[1, 2, 5, 10, 20]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-card>
        <!-- 新增编辑Modal -->
        <el-dialog
            title="编辑"
            v-model="modalShow"
            :close-on-click-modal="false"
            @close="_modalClose"
        >
            <el-form ref="form" :model="tempData" label-width="130px" :rules="rules">
                <el-form-item
                    v-for="(item, index) in _modalConfig"
                    :key="index"
                    :label="item.label"
                    :prop="item.attribute"
                >
                    <!-- 远程搜索 -->
                    <el-autocomplete
                        v-if="item.type === 'remoteSelect'"
                        ref="autoComplete"
                        v-model="tempData[item.attribute]"
                        :placeholder="`请输入${item.label}`"
                        :fetch-suggestions="fetchSuggestions(item.handleFunc)"
                        :value-key="item.remoteAttribute"
                        :trigger-on-focus="false"
                        @select="remoteConfirm"
                        @input="remoteInput"
                    >
                        <template #append>
                            <el-button
                                type="primary"
                                @click="remotePageChange(item.attribute)"
                            >下一页选项</el-button>
                        </template>
                    </el-autocomplete>
                    <!-- input -->
                    <el-input
                        v-if="item.type === 'input'"
                        v-model="tempData[item.attribute]"
                        :placeholder="`请输入${item.label}`"
                    />
                    <!-- 选择 -->
                    <el-select
                        v-if="item.type === 'select'"
                        v-model="tempData[item.attribute]"
                        :multiple="item.multiple"
                        :value-key="item.valueKey || 'value'"
                        @change="item.callBack"
                    >
                        <el-option
                            v-for="issue in item.selectList"
                            :key="issue.value[item.valueKey] || issue.value"
                            :value="issue.value"
                            :label="issue.label"
                        />
                    </el-select>
                    <!-- 时间选择器 -->
                    <el-date-picker
                        v-if="item.type === 'datePicker'"
                        v-model="tempData[item.attribute]"
                        clearable
                        :type="item.dateType ? item.dateType : 'date'"
                        :value-format="item['value-format'] || 'yyyy-MM-dd HH:mm:ss'"
                        placeholder="选择日期"
                    />
                    <!-- 图片上传 -->
                    <uplodImage
                        v-if="item.type === 'uploadImage'"
                        v-model="tempData[item.attribute]"
                        @uploadSuccess="item.uploadSuccess"
                        :need-ratio="item.needRatio || false"
                        :autoUpload="true"
                        :limit="item.length"
                    />
                    <UploadVideo
                        v-if="item.type === 'video'"
                        v-model="tempData[item.attribute]"
                        @uploadSuccess="item.uploadSuccess"
                    />
                    <RichEditor v-if="item.type === 'Editor'" v-model="tempData[item.attribute]" />
                </el-form-item>
            </el-form>
            <template #footer>
                <slot
                    name="footer"
                    :clearForm="clearForm"
                    :handleLoading="handleLoading"
                    :handleData="handleData"
                >
                    <el-button @click="clearForm">重置</el-button>
                    <el-button
                        style="margin-left: 20px !important"
                        type="primary"
                        :loading="handleLoading"
                        @click="handleData"
                    >确 定</el-button>
                </slot>
            </template>
        </el-dialog>
        <!-- 删除modal -->
        <el-dialog v-if="isDelete" title="删除警告" v-model="deleteModalShow">
            <span>确认要删除么？</span>
            <template #footer>
                <el-button @click="deleteModalShow = false">取 消</el-button>
                <el-button type="primary" :loading="handleLoading" @click="_handleDelete">确 定</el-button>
            </template>
        </el-dialog>
        <el-dialog v-if="otherModalTitle" :title="otherModalTitle" v-model="otherModalShow">
            <slot name="modal" :_otherModalFunc="_otherModalFunc" :tempData="tempData" />
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { formateDate } from '@/utils/util'
import db from '@/utils/localstorage'
import uplodImage from '@/components/UploadImage/index.vue';
import UploadVideo from '@/components/UploadVideo/index.vue'
import RichEditor from '@/components/Editor/richEditor.vue';
let state = reactive({
    name: 'TableForm',
    tableLoading: false,
    tableData: [],
    tableDataTotal: 0,
    handleLoading: false,
    tempData: {},
    editStatus: false,
    modalShow: false,
    deleteModalShow: false,
    otherModalShow: false,
    deleteObj: {},
    queryParams: {
        key: '',
        pageNum: 1,
        pageSize: 10
    },
    remotePage: 1
})
let { tableData, tableLoading, tableDataTotal, handleLoading, tempData, editStatus, modalShow, deleteModalShow, otherModalShow, deleteObj, queryParams, remotePage } = toRefs(state)
let { proxy }: any = getCurrentInstance()
const props = defineProps({
    authRouter: {
        type: String,
        default: ''
    },
    tableConfig: {
        type: Array,
        default: () => []
    },
    formData: {
        type: Function,
        default: () => ({})
    },
    modalConfig: {
        type: Array,
        default: () => []
    },
    isEdit: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: true
    },
    isPage: {
        type: Boolean,
        default: true
    },
    isSearch: {
        type: Boolean,
        default: true
    },
    remoteConfig: {
        type: Object,
        default: () => ({})
    },
    rules: {
        type: Object,
        default: () => ({})
    },
    getData: {
        type: Function,
        default: () => () => { }
    },
    handleAddData: {
        type: Function,
        default: () => () => { }
    },
    handleUpdateData: {
        type: Function,
        default: () => () => { }
    },
    handleDelete: {
        type: Function,
        default: () => () => { }
    },
    handleSee: {
        type: Function,
        default: () => () => { }
    },
    watchObj: {
        type: Object,
        default: null
    },
    otherModalTitle: {
        type: String,
        default: ''
    },
    otherModalFunc: {
        type: Function,
        default: () => () => { }
    }
})

let _modalConfig = computed(() => {
    return props.modalConfig.filter(item => {
        return !(item.type === 'select' && (!item.selectList || item.selectList.length === 0));
    });
})
watch(
    state.tempData,
    (val) => {
        db.save(props.authRouter || 'temp', val);
        console.log(val);

    },
    { deep: true }
)

onMounted(() => {
    _getData()
    if (props.watchObj && Object.keys(props.watchObj).length !== 0) {
        for (const key in props.watchObj) {
            watch(
                key.valueOf,
                props.watchObj[key].callback,
                props.watchObj[key].config
            );
        }
    }
    const tempDataA = db.get(props.authRouter || 'temp');
    state.tempData = tempDataA || props.formData();
})
const _getData = async () => {
    state.tableLoading = true;
    const res = await props.getData(state.queryParams);
    const { tableData, tableDataTotal } = res;
    state.tableData = tableData;
    state.tableDataTotal = tableDataTotal;
    state.tableLoading = false;
}
const _modalClose = () => {
    state.editStatus = false
}
const clearForm = () => {
    state.tempData = props.formData();
    proxy.$nextTick(() => {
        db.remove(props.authRouter || 'temp');
    });
}
const addClick = () => {
    state.modalShow = true
}
const handleData = () => {
    proxy.$refs.form.validate(async (valid: boolean) => {
        if (!valid) {
            proxy.$message.error('请检查输入是否不符合规范');
            return;
        }
        state.handleLoading = true;
        let res;
        try {
            if (state.editStatus) {
                res = await props.handleUpdateData(state.tempData);
                console.log(1, res);
            } else {
                res = await props.handleAddData(state.tempData);
                console.log(2, res);
            }
        } catch (err) {
            console.log(err);
        }
        if (res && res.data) {
            clearForm();
            _getData();
            state.modalShow = false;
            proxy.$message({ message: '处理成功~', type: 'success' });
        } else {
            proxy.$message.error('出现了预期之外的错误，请联系程序猿~');
            proxy.$message.error(res.data.message);
        }
        state.handleLoading = false;
    })
}
const seeClick = () => {
    state.handleLoading = true;
    props.handleSee();
    state.handleLoading = false;
}
const deleteClick = (obj: any) => {
    state.deleteObj = obj;
    state.deleteModalShow = true;
}
const _otherModalFunc = async (obj: any) => {
    state.handleLoading = true
    let res;
    try {
        res = await props.otherModalFunc(obj);
    } catch (err) {
        console.log(err);
    }
    if (res && res.data && res.data.code === 10000) {
        _getData();
        state.otherModalShow = false;
        proxy.$message({ message: '处理成功~', type: 'success' });
    } else {
        proxy.$message.error('出现了预期之外的错误，请联系程序猿~');
        proxy.$message.error(res.data.message);
    }
    state.handleLoading = false;
}
const _handleDelete = async () => {
    state.handleLoading = true;
    let res;
    try {
        res = await props.handleDelete(deleteObj);
    } catch (err) {
        console.log(err);
    }
    if (res && res.data && res.data.code === 10000) {
        _getData();
        state.deleteModalShow = false;
        proxy.$message({ message: '处理成功~', type: 'success' });
    } else {
        proxy.$message.error('出现了预期之外的错误，请联系程序猿~');
        proxy.$message.error(res.data.message);
    }
    state.handleLoading = false;
}
const editClick = (data: any) => {
    state.editStatus = true;
    state.modalShow = true;
    state.tempData = JSON.parse(JSON.stringify(data));
    proxy.$nextTick(() => {
        // 根据日期格式格式化时间
        for (const item of props.modalConfig) {
            if (item.type === 'datePicker' && tempData[item.attribute]) {
                tempData[item.attribute] = formateDate(
                    tempData[item.attribute],
                    item['value-format']
                );
            }
        }
    });
}
const handleSizeChange = (newPageSize: number) => {
    state.queryParams.pageSize = newPageSize;
    _getData();
}
const handleCurrentChange = (newPageNum: number) => {
    state.queryParams.pageNum = newPageNum;
    _getData();
}
const remoteConfirm = (obj: any) => {
    for (let key in props.remoteConfig) {
        state.tempData[key] = obj[props.remoteConfig[key]];
    }
    state.remotePage = 1;
}
const remoteInput = () => {
    state.remotePage = 1;
}
const remotePageChange = () => {
    state.remotePage += 1;
    proxy.$refs.autoComplete[0].debouncedGetData(proxy.$refs.autoComplete[0].value)
    proxy.$refs.autoComplete[0].focus();
}
const fetchSuggestions = (func: Function) => {
    return async (queryString, cb) => {
        cb(await func(queryString, remotePage));
    };
}
const handleSelectionChange = (row: string) => {
    console.log(row);
}
</script>