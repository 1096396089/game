import { User } from './model/user.model';
import { Order } from './model/order.model';

// 这里导出所有需要注入的 Typegoose 模型类
export const model_list: any[] = [
  User,
  Order,
]; 