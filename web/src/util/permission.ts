import { useAuthStore } from '@/stores/auth';

// 用户角色枚举（与后端保持一致）
export enum UserRole {
  ROOT = 'root',             // 超级管理员  
  ADMIN = 'admin',           // 管理员
  MANAGER = 'manager',       // 经理
  SALES = 'sales',           // 销售人员
  FINANCE = 'finance',       // 财务人员
  HR = 'hr',                 // 人力资源
  CUSTOMER_SERVICE = 'cs',   // 客服
  USER = 'user',             // 普通用户
  OPERATION = 'operation',   // 运营人员
  MARKETING = 'marketing',   // 市场营销人员
  TECHNICAL = 'technical',   // 技术人员
}

// 角色权重映射，数字越大权限越高
export const ROLE_WEIGHTS: Record<string, number> = {
  [UserRole.ROOT]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.MANAGER]: 80,
  [UserRole.FINANCE]: 70,
  [UserRole.HR]: 60,
  [UserRole.OPERATION]: 50,
  [UserRole.MARKETING]: 40,
  [UserRole.SALES]: 30,
  [UserRole.TECHNICAL]: 30,
  [UserRole.CUSTOMER_SERVICE]: 20,
  [UserRole.USER]: 10
};

// 检查用户是否有指定角色
export function hasRole(role: UserRole | UserRole[]): boolean {
  const authStore = useAuthStore();
  const userRoles = authStore.userInfo?.roles || [];
  
  if (Array.isArray(role)) {
    return role.some(r => userRoles.includes(r));
  }
  
  return userRoles.includes(role);
}

// 检查用户是否至少拥有指定角色的权限级别
export function hasRolePermission(minimumRole: UserRole): boolean {
  const authStore = useAuthStore();
  const userRoles = authStore.userInfo?.roles || [];
  
  const minimumWeight = ROLE_WEIGHTS[minimumRole] || 0;
  
  // 检查用户的最高权限是否达到或超过最低要求
  return userRoles.some(role => (ROLE_WEIGHTS[role] || 0) >= minimumWeight);
}

// 角色显示名称映射
export const ROLE_NAMES: Record<string, string> = {
  [UserRole.ROOT]: '超级管理员',
  [UserRole.ADMIN]: '管理员',
  [UserRole.MANAGER]: '经理',
  [UserRole.SALES]: '销售人员',
  [UserRole.FINANCE]: '财务人员',
  [UserRole.HR]: '人力资源',
  [UserRole.CUSTOMER_SERVICE]: '客服',
  [UserRole.USER]: '普通用户',
  [UserRole.OPERATION]: '运营人员',
  [UserRole.MARKETING]: '市场营销',
  [UserRole.TECHNICAL]: '技术人员'
};

// 获取角色的中文名称
export function getRoleName(role: string): string {
  return ROLE_NAMES[role] || role;
} 