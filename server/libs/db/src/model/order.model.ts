import { prop, modelOptions } from '@typegoose/typegoose';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  NEW = 'NEW',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  STOP_MARKET = 'STOP_MARKET',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_MARKET = 'TAKE_PROFIT_MARKET',
  LIMIT_MAKER = 'LIMIT_MAKER',
}

export class Order {
  @prop()
  symbol: string;

  @prop()
  orderId: number;

  @prop()
  clientOrderId: string;

  @prop({ enum: OrderSide })
  side: OrderSide;

  @prop({ enum: OrderType })
  type: OrderType;

  @prop({ enum: OrderStatus })
  status: OrderStatus;

  @prop()
  price: string;

  @prop()
  origQty: string;

  @prop()
  executedQty: string;

  @prop()
  cummulativeQuoteQty: string;

  @prop()
  transactTime: number;

  @prop({ type: () => [Object] })
  fills?: any[];
  
  @prop()
strategy?: string;
}
