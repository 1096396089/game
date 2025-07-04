import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS
  app.enableCors();
  
  // 设置全局路由前缀
  app.setGlobalPrefix('api');
  
  // Swagger 配置
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/api-docs', app, document);
  
  // 启动服务器
  const PORT = process.env.SERVER_PORT || 3000;
  await app.listen(PORT);
  console.log(`Application is running on: http://localhost:${PORT}/api/api-docs`);
}
bootstrap();
