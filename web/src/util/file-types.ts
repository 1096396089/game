// 文件类型枚举
export enum FileType {
  DOCUMENT = 'document',      // 文档
  IMAGE = 'image',            // 图片
  SPREADSHEET = 'spreadsheet', // 电子表格
  PRESENTATION = 'presentation', // 演示文稿
  CONTRACT = 'contract',      // 合同
  INVOICE = 'invoice',        // 发票文件
  REPORT = 'report',          // 报告文件
  OTHER = 'other',            // 其他类型
  AUDIO = 'audio',            // 音频
  VIDEO = 'video',            // 视频
  ARCHIVE = 'archive'         // 压缩文件
}

// 文件关联业务类型
export enum BusinessType {
  CONTRACT = 'contract',      // 合同
  FINANCE = 'finance',        // 财务
  EMPLOYEE = 'employee',      // 员工
  PROJECT = 'project',        // 项目
  CUSTOMER = 'customer',      // 客户
  SUPPLIER = 'supplier',      // 供应商
  GENERAL = 'general',        // 通用文件
  OTHER = 'other'             // 其他
} 