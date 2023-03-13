<template>
  <div class="upload-file">
    <el-upload
        :multiple="multiple"
        :action="uploadFileUrl"
        :file-list="fileList"
        :limit="limit"
        :drag="drag"
        :auto-upload="autoUpload"
        :disabled="disabled"
        :show-file-list="true"
        :headers="headers"
        :data="fileData"
        :before-upload="handleBeforeUpload"
        :on-error="handleUploadError"
        :on-change="handleUploadChange"
        :on-exceed="handleExceed"
        :on-success="handleUploadSuccess"
        class="upload-file-uploader"
        ref="fileUpload">
      <!-- 拖拽上传 -->
      <template v-if="drag">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </template>
      <!-- 上传按钮 -->
      <el-button v-else size="mini" type="primary">选取文件</el-button>
      <!-- 上传提示 -->
      <div class="el-upload__tip" slot="tip" v-if="showTip">
        请上传
        <template v-if="fileSize"> 大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
        <template v-if="fileType"> 格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
        的文件
      </div>
    </el-upload>
  </div>
</template>

<script>
import { getAccessToken } from "@/utils/auth";

export default {
  name: "FileUpload",
  props: {
    // 值
    value: [String, Object, Array],
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 是否自动上传
    autoUpload: {
      type: Boolean,
      default: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 上传参数
    fileData: {
      type: Object,
      default: () => ({})
    },
    // 数量限制
    limit: {
      type: Number,
      default: 5,
    },
    // 是否可拖拽
    drag: {
      type: Boolean,
      default: false
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 5,
    },
    // 文件类型
    fileType: {
      type: Array,
      default: () => ["doc", "xls", "ppt", "txt", "pdf"],
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    },
    // 上传请求头部
    headers: {
      type: Object,
      default: () => ({
        Authorization: "Bearer " + getAccessToken(),
        "Content-Type": "multipart/form-data"
      })
    },
  },
  data() {
    return {
      number: 0,
      fileList: [],
      uploadList: [],
      uploadFileUrl: process.env.VUE_APP_BASE_API + "/admin-api/operations/contract/create", // 请求地址
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          let temp = 1;
          // 首先将值转为数组
          const list = Array.isArray(val) ? val : this.value.split(',');
          // 然后将数组转为对象数组
          this.fileList = list.map(item => {
            if (typeof item === "string") {
              item = { name: item, url: item };
            }
            item.uid = item.uid || new Date().getTime() + temp++;
            return item;
          });
        } else {
          this.fileList = [];
          return [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    },
  },
  methods: {
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        const isTypeOk = this.fileType.some((type) => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
        if (!isTypeOk) {
          this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join("/")}格式文件!`);
          return false;
        }
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`上传文件大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading("正在上传文件，请稍候...");
      this.number++;
      return true;
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit} 个!`);
    },
    // 上传失败
    handleUploadError(err) {
      this.$modal.msgError("上传图片失败，请重试");
      this.$modal.closeLoading()
    },
    // 监控上传文件列表
    handleUploadChange(file, fileList) {
      let existFile = fileList.slice(0, fileList.length - 1).find(f => f.name === file.name);
      if (existFile) {
        this.$message.error('请勿重复上传文件!');
        fileList.pop();
      }
      this.fileList = fileList;
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      if (res.code === 200) {
        // edit by 芋道源码
        this.uploadList.push({ name: res.data, url: res.data });
        this.uploadedSuccessfully();
      } else {
        this.number--;
        this.$modal.closeLoading();
        this.$modal.msgError(res.msg);
        this.$refs.fileUpload.handleRemove(file);
        this.uploadedSuccessfully();
      }
    },
    // 上传结束处理
    uploadedSuccessfully() {
      if (this.number > 0 && this.uploadList.length === this.number) {
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        this.$emit("input", this.listToString(this.fileList));
        this.$modal.closeLoading();
      }
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        strs += list[i].url + separator;
      }
      return strs != '' ? strs.substr(0, strs.length - 1) : '';
    }
  }
};
</script>
