import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DbModule } from 'libs/db/src/db.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    DbModule,
    ScheduleModule.forRoot(),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
