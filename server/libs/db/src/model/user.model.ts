import { Prop } from '@typegoose/typegoose';

export class User {
  @Prop()
   name: string;

  @Prop()
   email: string;

  @Prop()
   password: string;

  @Prop()
   createdAt: Date;
}


