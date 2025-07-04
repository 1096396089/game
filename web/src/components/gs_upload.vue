<template>
  <div>
    <el-upload
      :file-list="fileList"
      :http-request="customUpload"
      :before-upload="beforeUpload"
      :limit="maxCount"
      :multiple="multiple"
      :show-file-list="true"
      list-type="text"
      :drag="drag"
      @remove="handleRemove"
      @preview="handlePreview"
    >
      <el-button v-if="!drag" type="primary">选择文件上传</el-button>
      <template v-else>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或点击上传</div>
      </template>
    </el-upload>

    <div class="el-upload__tip">
      单文件最大 {{ maxSize }}MB，格式：{{ accept.join(', ') || '不限' }}，最多上传
      {{ maxCount }} 个文件
    </div>
    <!-- 上传进度 -->
    <el-progress v-if="uploading" :percentage="progress" status="success" class="mt-2" />
    
    <!-- 文件预览对话框 -->
    <el-dialog v-model="previewVisible" :title="previewTitle" width="70%">
      <div class="preview-container">
        <!-- 图片预览 -->
        <div v-if="previewFileType === 'image'" class="preview-content">
          <img :src="previewUrl" class="preview-image" />
        </div>
        
        <!-- PDF预览 -->
        <div v-else-if="previewFileType === 'pdf'" class="preview-content">
          <iframe :src="previewUrl" class="preview-frame"></iframe>
        </div>
        
        <!-- Office文档预览 -->
        <div v-else-if="isOfficeDocument" class="preview-content">
          <iframe :src="getOfficePreviewUrl" class="preview-frame"></iframe>
        </div>
        
        <!-- 其他文件类型 -->
        <div v-else class="preview-actions">
          <div class="file-icon">
            <i :class="getFileIconClass(previewFileType)" class="file-type-icon"></i>
          </div>
          <p class="file-name">{{ previewTitle }}</p>
          <p class="file-type">{{ getFileTypeName(previewFileType) }}</p>
          <div class="action-buttons">
            <el-button type="primary" @click="openFileInNewTab">在线预览</el-button>
            <el-button type="success" @click="downloadFile">下载文件</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/util/http'
import axios from 'axios'

const props = defineProps({
  modelValue: [String, Array],
  businessType: { type: String, default: 'general' },
  isPrivate: { type: Boolean, default: false },
  maxSize: { type: Number, default: 10 },
  accept: { type: Array as () => string[], default: () => [] },
  multiple: { type: Boolean, default: false },
  drag: { type: Boolean, default: false },
  maxCount: { type: Number, default: 10 },
})

const emit = defineEmits(['update:modelValue', 'success', 'remove'])

const fileList = ref<any[]>([])
const uploading = ref(false)
const progress = ref(0)

// 预览相关
const previewVisible = ref(false)
const previewUrl = ref('')
const previewTitle = ref('')
const currentFile = ref<any>(null)

// 计算当前预览文件类型
const previewFileType = computed(() => {
  return getFileTypeByUrl(previewUrl.value)
})

// 判断是否为Office文档
const isOfficeDocument = computed(() => {
  if (!previewUrl.value) return false
  const extension = previewUrl.value.split('.').pop()?.toLowerCase() || ''
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)
})

// 获取Office文档预览URL
const getOfficePreviewUrl = computed(() => {
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewUrl.value)}`
})

// 处理文件预览
const handlePreview = (file: any) => {
  currentFile.value = file
  previewUrl.value = file.url || file.response
  previewTitle.value = file.name || '文件预览'
  previewVisible.value = true
}

// 获取文件图标类名
const getFileIconClass = (fileType: string) => {
  const iconMap: Record<string, string> = {
    'image': 'el-icon-picture',
    'pdf': 'el-icon-document',
    'document': 'el-icon-document-text',
    'spreadsheet': 'el-icon-tickets',
    'presentation': 'el-icon-collection',
    'other': 'el-icon-files'
  }
  return iconMap[fileType] || 'el-icon-document'
}

// 获取文件类型名称
const getFileTypeName = (fileType: string) => {
  const typeMap: Record<string, string> = {
    'image': '图片文件',
    'pdf': 'PDF文档',
    'document': '文本文档',
    'spreadsheet': '电子表格',
    'presentation': '演示文稿',
    'other': '其他文件'
  }
  return typeMap[fileType] || '未知文件类型'
}

// 判断是否为图片文件
const isImageFile = (url: string) => {
  if (!url) return false
  const ext = url.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')
}

// 获取文件类型
const getFileTypeByUrl = (url: string) => {
  if (!url) return 'other'
  const ext = url.split('.').pop()?.toLowerCase() || ''
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
    return 'image'
  } else if (['pdf'].includes(ext)) {
    return 'pdf'
  } else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return 'document'
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'spreadsheet'
  } else if (['ppt', 'pptx'].includes(ext)) {
    return 'presentation'
  } else {
    return 'other'
  }
}

// 在新标签页打开文件
const openFileInNewTab = () => {
  const fileType = getFileTypeByUrl(previewUrl.value);
  const url = previewUrl.value;
  
  // 对于PDF文件，可以直接在浏览器中预览
  if (fileType === 'pdf') {
    window.open(url, '_blank');
  } 
  // 对于Office文档，使用Microsoft Office在线预览或Google Docs预览
  else if (fileType === 'document' || fileType === 'spreadsheet' || fileType === 'presentation') {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    // 判断是否为Office文档
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      // 使用Microsoft Office在线预览
      const msViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
      window.open(msViewerUrl, '_blank');
    } 
    // 对于文本文件，使用Google Docs预览
    else if (['txt', 'rtf', 'csv'].includes(extension)) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleDocsUrl, '_blank');
    } 
    // 其他文件直接打开
    else {
      window.open(url, '_blank');
    }
  } 
  // 对于图片和其他类型文件，直接在新标签页打开
  else {
    window.open(url, '_blank');
  }
}

// 下载文件
const downloadFile = () => {
  const link = document.createElement('a')
  link.href = previewUrl.value
  link.download = previewTitle.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 初始化文件列表
const initFileList = () => {
  fileList.value = [];
  if (!props.modelValue) return;
  if (Array.isArray(props.modelValue)) {
    fileList.value = props.modelValue.map((url, index) => {
      return {
        //@ts-ignore
        name: url.split('/').pop() || `文件${index + 1}`,
        url: url
      };
    });
  } else if (typeof props.modelValue === 'string' && props.modelValue) {
    const fileName = props.modelValue.split('/').pop() || '文件';
    fileList.value = [{
      name: fileName,
      url: props.modelValue
    }];
  }
  
  // console.log('初始化文件列表', fileList.value);
}

// 监听modelValue变化
watch(() => props.modelValue, () => {
  initFileList();
}, { deep: true, immediate: true });

// 组件挂载时初始化文件列表
onMounted(() => {
  initFileList();
});

const beforeUpload = (file: File) => {
  const sizeMB = file.size / 1024 / 1024
  if (sizeMB > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  if (props.accept.length) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!props.accept.includes(ext || '')) {
      ElMessage.error(`仅支持以下格式：${props.accept.join(', ')}`)
      return false
    }
  }
  return true
}

// 处理文件移除
const handleRemove = (file: any, fileList: any[]) => {
  console.log('文件被移除', file, fileList)
  
  // 更新父组件的文件列表
  if (props.multiple) {
    // 获取剩余文件的URL列表
    const remainingUrls = fileList.map(f => f.url || f.response)
    emit('update:modelValue', remainingUrls)
  } else {
    emit('update:modelValue', '')
  }
  
  // 发出移除事件，让父组件可以进行额外处理
  emit('remove', file)
}

const customUpload = async (option: any) => {
  const file = option.file as File
  uploading.value = true
  progress.value = 0

  try {
    const data: any = await http.post('/get_signed_url', null, {
      params: {
        folder: props.businessType,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      },
    })
    await axios.put(data.signedUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      onUploadProgress: (e) => {
        if (e.total) progress.value = Math.round((e.loaded / e.total) * 100)
      },
    })

    // 文件扩展名
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 构建符合FileList模型的fileInfo对象
    const fileInfo = {
      fileName: file.name,
      originalName: file.name,
      fileType: getFileType(extension),
      businessType: props.businessType,
      mimeType: file.type || 'application/octet-stream',
      extension: extension,
      fileSize: Math.round(file.size / 1024), // 转换为KB
      filePath: data.filename,
      fileUrl: data.publicUrl,
      tags: [],        // 可以从外部传入或在父组件中设置
      isPrivate: props.isPrivate,
      accessUsers: [],
      accessDepartments: []
    }

    if (props.multiple) {
      const newList = Array.isArray(props.modelValue) ? [...props.modelValue] : []
      newList.push(data.publicUrl)
      emit('update:modelValue', newList)
    } else {
      emit('update:modelValue', data.publicUrl)
    }
    emit('success', fileInfo)
    await http.post('/file-list', fileInfo)    
    ElMessage.success('上传成功')
  } catch (err) {
    console.log(err)
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
    progress.value = 0
  }
}

// 根据文件扩展名判断文件类型
const getFileType = (extension: string): string => {
  const documentExtensions = ['doc', 'docx', 'pdf', 'txt', 'rtf'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];
  const presentationExtensions = ['ppt', 'pptx'];
  
  if (documentExtensions.includes(extension)) {
    return 'document';
  } else if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (spreadsheetExtensions.includes(extension)) {
    return 'spreadsheet';
  } else if (presentationExtensions.includes(extension)) {
    return 'presentation';
  } else if (props.businessType === 'contract') {
    return 'contract';
  } else if (props.businessType === 'finance') {
    return 'invoice';
  } else if (['report', 'project'].includes(props.businessType)) {
    return 'report';
  } else {
    return 'other';
  }
}
</script>

<style scoped>
.mt-2 {
  margin-top: 10px;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-frame {
  width: 100%;
  height: 70vh;
  border: none;
}

.preview-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px;
  text-align: center;
}

.file-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #409EFF;
}

.file-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  word-break: break-all;
  max-width: 80%;
}

.file-type {
  color: #909399;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
</style>
