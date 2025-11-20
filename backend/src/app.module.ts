import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { DevicesController } from './modules/devices/devices.controller';
import { DevicesService } from './modules/devices/devices.service';
import { SessionsController } from './modules/sessions/sessions.controller';
import { SessionsService } from './modules/sessions/sessions.service';
import { User } from './modules/users/entities/user.entity';
import { Device } from './modules/devices/entities/device.entity';
import { Session } from './modules/sessions/entities/session.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'zalo_account_manager'),
        entities: [User, Device, Session],
        synchronize: true, // Chỉ dùng trong development
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Device, Session]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, DevicesController, SessionsController],
  providers: [AuthService, DevicesService, SessionsService],
})
export class AppModule {}
