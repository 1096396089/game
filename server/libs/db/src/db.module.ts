import { Module, DynamicModule, Global } from '@nestjs/common';
import { mongoose, setGlobalOptions, getModelForClass } from '@typegoose/typegoose';
import { model_list } from './model_list';



// 设置 Typegoose 全局选项
setGlobalOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
  },
});

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'DbService',
      useFactory: () => mongoose.connect(process.env.DB, {}),
    },
    ...model_list.map(model => ({
      provide: model,
      useFactory: () => getModelForClass(model),
    })),
  ],
  exports: [
    'DbService',
    ...model_list,
  ],
})
export class DbModule {} 