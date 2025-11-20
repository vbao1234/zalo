import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Device } from '../devices/entities/device.entity';
import { Session } from '../sessions/entities/session.entity';
import { DevicesService } from '../devices/devices.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(user: User, deviceId: string) {
    // Kiểm tra device
    const device = await this.devicesRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      throw new UnauthorizedException('Device not registered');
    }

    // HYBRID MODE: Bỏ check "User already logged in on another device"
    // Cho phép 1 user login trên nhiều devices đồng thời

    // End sessions cũ của user trên device này (cleanup)
    await this.sessionsService.endUserSessionsOnDevice(user.id, device.id);

    // Update device owner động
    await this.devicesService.updateDeviceOwner(deviceId, user.id);

    // Tạo tokens
    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Tạo session mới
    const session = this.sessionsRepository.create({
      userId: user.id,
      deviceId: device.id,
      accessToken,
      refreshToken,
      isActive: true,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.sessionsRepository.save(session);

    return {
      accountId: user.id,
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
      },
      device: {
        id: device.id,
        deviceId: device.deviceId,
        brand: device.brand,
        model: device.model,
      },
    };
  }

  async register(registerDto: any) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      displayName: registerDto.displayName,
      email: registerDto.email,
      phone: registerDto.phone,
    });

    await this.usersRepository.save(user);

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        username: payload.username,
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
