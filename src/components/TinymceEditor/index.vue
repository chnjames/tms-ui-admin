<template>
  <div class="tinymce-box">
    <slot/>
    <Editor v-model="contentValue" :init="initOptions" :id="id" :disabled="disabled"  @change="callBack"/>
    <slot name="footer"/>
  </div>
</template>

<script>
// import api from '/@/api';
//引入tinymce编辑器
import tinymce from 'tinymce/tinymce';
import Editor from '@tinymce/tinymce-vue';
import 'tinymce/themes/silver'; // 默认主题
import 'tinymce/icons/default'; // 默认图标
import 'tinymce/plugins/advlist'; // 高级列表
import 'tinymce/plugins/anchor'; // 锚点
import 'tinymce/plugins/autolink'; // 自动链接
import 'tinymce/plugins/autoresize'; // 自动调整大小，让编辑器自适应文本高度
import 'tinymce/plugins/autosave'; // 自动保存
import 'tinymce/plugins/charmap'; // 字符编码表
import 'tinymce/plugins/code'; // 源代码
import 'tinymce/plugins/codesample'; // 源代码示例
import 'tinymce/plugins/directionality'; // 文本方向
import 'tinymce/plugins/emoticons'; // 表情
import 'tinymce/plugins/fullscreen'; // 全屏
import 'tinymce/plugins/image'; // 图片
import 'tinymce/plugins/importcss'; // 导入样式表
import 'tinymce/plugins/help'; // 帮助
import 'tinymce/plugins/insertdatetime'; // 插入日期与时间
import 'tinymce/plugins/link'; // 链接
import 'tinymce/plugins/lists'; // 列表
import 'tinymce/plugins/media'; // 媒体
import 'tinymce/plugins/nonbreaking'; // 不间断空格
import 'tinymce/plugins/pagebreak'; // 不可编辑
import 'tinymce/plugins/preview'; // 预览
import 'tinymce/plugins/quickbars'; // 快捷栏
import 'tinymce/plugins/searchreplace'; // 查找替换
import 'tinymce/plugins/save'; // 保存
import 'tinymce/plugins/table'; // 表格
import 'tinymce/plugins/template'; // 模板
import 'tinymce/plugins/visualblocks'; // 显示隐藏的区块
import 'tinymce/plugins/visualchars'; // 显示隐藏的字符
import 'tinymce/plugins/wordcount'; // 字数统计

export default {
  name: 'TinymceEditor',
  components: {
    Editor
  },
  props: {
    value: {
      type: String,
      required: true,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 600
    },
    placeholder: {
      type: String,
      default: '在这里输入文字'
    },
    toolbar: {
      type: [Array, String],
      default: "code undo redo | forecolor backcolor bold italic underline strikethrough link | alignleft aligncenter alignright alignjustify lineheight | bullist numlist | table image media"
    },
    plugins: {
      type: [Array, String],
      default: 'code codesample preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount autosave '
    },
    id: {
      type: [String, Number],
      default: `Tinymce`
    }
  },
  data() {
    return {
      contentValue: this.value
    }
  },
  computed: {
    initOptions() {
      return {
        language: 'zh-Hans',
        language_url: '/tinymce/langs/zh-Hans.js',
        skin_url: '/tinymce/skins/ui/oxide',
        content_css: '/tinymce/skins/content/default/content.css',
        content_style: 'body{font-size:14px;font-family:Microsoft YaHei,微软雅黑,宋体,Arial,Helvetica,sans-serif;line-height:1.5}img {max-width:100%;}',
        line_height_formats: '1 1.2 1.4 1.6 2', //行高
        font_size_formats: '12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 48px 56px 72px', //字体大小
        font_family_formats: '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
        images_file_types: 'jpeg,jpg,png,gif,bmp',
        height: this.height,
        toolbar: this.toolbar,
        plugins: this.plugins,
        menubar: false, // 取消默认的菜单栏
        placeholder: this.placeholder, // 提示文字
        autosave_ask_before_unload:false,//刷新页面弹窗提示
        branding: false, // 去除编辑器logo
        resize: false, // 禁止调整大小
        statusbar: false, // 去除状态栏
        elementpath: false, // 去除元素路径
        // forced_root_block: false, // 去除默认的 P 标签
        custom_undo_redo_levels: 10, // 自定义撤销恢复次数
        draggable_modal: true, // 拖拽模态框
        // media_alt_source :false,
        // media_poster :false,
        // media_dimensions  :false,
        // images_upload_url: '/image/edu/certificate',
        // images_upload_base_path: '',
        // images_upload_handler: (blobInfo:any) => {
        //   return new Promise((resolve, reject) => {
        //     let fd = new FormData();
        //     fd.append("image", blobInfo.blob())
        //     api.edu.image.edu.certificate({ method:'POST', data:fd }).then((res:any) => {
        //       const img = res.imageUrl
        //       resolve(img)//上传成功，在成功函数里填入图片路径
        //     }).catch(() => {
        //       reject("上传失败")
        //     })
        //   })
        // }
      }
    },
  },
  watch: {
    //监听内容变化
    value(val) {
      this.contentValue = val === null ? '' : val
    },
    contentValue(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    callBack() {
      this.$emit('change', this.contentValue)
    },
    clear() {
      this.contentValue = '';
    }
  },
  mounted() {
    tinymce.init({}); //初始化
  },
  beforeDestroy() {
    tinymce.remove(); //销毁
  }
}
</script>

<style lang="scss" scoped>
.tinymce-box {
  width: 100%;
  :deep(.tox-tinymce) {
    border-radius: 0 !important;
    border: none;
    border-top: 2px solid #eee;
    border-bottom: 2px solid #eee;
  }
}
</style>
