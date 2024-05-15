import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
// import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/nest_auth'),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // APP_FILTER :{
    //   provide: HttpException,
    //   useValue:{}
    // }
  ],
})
export class AppModule {}
