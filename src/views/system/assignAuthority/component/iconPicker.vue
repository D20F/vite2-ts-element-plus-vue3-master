<template>
    <el-popover
        placement="bottom-start"
        popper-class="pupop-select-icon"
        transition="el-zoom-in-top"
        trigger="click"
        width="550px"
        v-model:visible="popoverVisible"
        :disabled="disabledSelected"
    >
        <el-scrollbar
            style="height: 300px;width:500px"
            class="hide-x"
            :native="false"
            :noresize="false"
        >
            <div
                class="icon-item"
                v-for="item in options"
                :key="item"
                :class="{ 'is-active': isActive(item) }"
                @click="onClickSelected(item)"
            >
                <svg-icon :icon-class="item" style="font-size:25px"></svg-icon>
            </div>
        </el-scrollbar>
        <template #reference>
            <svg-icon
                style="font-size:30px;  border: 1px dashed #dcdfe6;  margin-right: 5px;"
                :class="{
                    'is-disabled': disabledSelected,
                }"
                :icon-class="value || 'add-bold'"
            ></svg-icon>
        </template>
    </el-popover>
</template>

<script setup lang="ts">
import { computed, toRefs, reactive, onBeforeMount, getCurrentInstance } from 'vue';
const ICont = import.meta.glob('../../../../icons/common/*.svg');
let seta: any = reactive({
    popoverVisible: false,
    options: [],
    value: ""
})
let props = defineProps({
    disabled: Boolean,
});
let disabledSelected = computed(() => {
    if (props.disabled) {
        console.log(props.disabled);
        return true;
    }
    return proxy.$parent.form ? proxy.$parent.form.disabled : false;
})
let { proxy }: any = getCurrentInstance()
const asb = () => {
    for (const key in ICont) {
        if (Object.prototype.hasOwnProperty.call(ICont, key)) {
            const element = ICont[key];
            seta.options.push(element.name.slice(25, -4))
        }
    }
}
onBeforeMount(() => {
    asb()
})
const isActive = (item: any) => {
    return seta.value === item;
}
//emit
// 定义emit事件
const emit = defineEmits(['input', 'Clearinput'])
const onClickSelected = (item: any) => {
    seta.popoverVisible = false;
    seta.value = item
    emit("input", item);
}
const onClickClear = () => {
    seta.value = ""
    emit("Clearinput", "");
}
let { popoverVisible, options, value } = toRefs(seta)

</script>
<style lang="scss" scoped>
.hide-x {
    width: 400px;
    height: 400px;
}

.mod-select-icon {
    position: relative;
    display: inline-block;
    width: 40px + 2px;
    height: 40px + 2px;
    border: 1px dashed #dcdfe6;
    border-radius: 5px;
    text-align: center;
    cursor: pointer;
    outline: none;
    .el-popper.is-light {
        width: auto !important;
    }
    // // 菜单打开状态
    &.is-opened,
    &:hover {
        border-color: #409eff;
    }
    // 禁用状态
    &.is-disabled:hover {
        border-color: #dcdfe6 !important;
    }
    &.is-disabled,
    &.is-disabled > .icon-item,
    &.is-disabled > .btn-clear {
        // @extend .z-not-allowed;
        background-color: #f5f7fa;
    }
    // 已选状态
    &.is-active {
        border-style: solid;
        border-radius: 0;
        > .icon-item {
            width: 40px;
            height: 40px;
            line-height: 40px;
            padding: 5px;
            text-align: center;
            cursor: pointer;
            > i {
                display: block;
                width: 100%;
                height: 100%;
                line-height: 40px - (5px * 2);
                color: #fff;
                background-color: #409eff;
            }
        }
    }
    > .icon-item > i {
        font-size: 16px;
    }
    > .icon-item > i.el-icon-plus {
        width: 100%;
        line-height: 40px;
        font-size: 20px;
        font-weight: bold;
        color: #909399;
        cursor: inherit;
    }

    // 清空按钮
    .btn-clear {
        width: 0;
        height: 0;
        border-width: 20px 0 0 20px;
        border-style: solid;
        border-color: #f56c6c transparent transparent transparent;
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        > i.el-icon-close {
            position: absolute;
            top: -20px;
            right: 0;
            color: #fff;
            font-size: 0.7em;
            &:hover {
                color: darken(#fff, 5%);
            }
        }
    }

    // 弹出内容
    @at-root .el-popover.el-popper.pupop-select-icon {
        display: block;
        padding: 0;
        width: (40px + 5px * 2) * 8 + 2px;
        height: (40px + 5px * 2) * 4;

        > .el-scrollbar {
            height: 100%;
        }
        .icon-item {
            float: left;
            width: 40px;
            height: 40px;
            line-height: 40px;
            margin: 5px;
            padding: 5px;
            text-align: center;
            cursor: pointer;
            &:hover {
                background-color: mix(#fff, #909399, 80%);
            }
            &.is-active {
                background-color: mix(#fff, #67c23a, 80%);
                border: 1px solid #67c23a;
            }
            > i {
                display: block;
                width: 100%;
                height: 100%;
                font-size: 16px;
                line-height: 30px;
                color: #fff;
                background-color: #409eff;
            }
        }
    }
}
</style>
