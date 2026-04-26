import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join, resolve } from 'node:path';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { JobModule } from './modules/job/job.module';
import { CommonModule } from './common';
import { SharedAutnenticationModule } from './common/modules/autnentication.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AdminModule } from './modules/admin/admin.module';
import { RealTimeModule } from './modules/gateway/gateway.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      connectionFactory: (connection) => {
        console.log('✅ Connected to MongoDB :', connection.name);
        return connection;
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      sortSchema: true,
    }),

    SharedAutnenticationModule,
    AuthModule,
    UserModule,
    CompanyModule,
    JobModule,
    CommonModule,
    AdminModule,
    RealTimeModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
