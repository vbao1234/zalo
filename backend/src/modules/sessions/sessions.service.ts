import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { Device } from '../devices/entities/device.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  async startSession(userId: string, deviceId: string) {
    // Kiểm tra user và device
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const device = await this.devicesRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // HYBRID MODE: Tự động end sessions cũ của user trên cùng device
    await this.endUserSessionsOnDevice(userId, deviceId);

    // Tạo session mới
    const session = this.sessionsRepository.create({
      userId,
      deviceId,
      isActive: true,
      startedAt: new Date(),
    });

    await this.sessionsRepository.save(session);

    return {
      message: 'Session started successfully',
      session,
    };
  }

  async endSession(userId: string) {
    const session = await this.sessionsRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!session) {
      throw new NotFoundException('No active session found');
    }

    session.isActive = false;
    session.endedAt = new Date();
    await this.sessionsRepository.save(session);

    return {
      message: 'Session ended successfully',
      session,
    };
  }

  async refreshSession(sessionId: string) {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Session is not active');
    }

    session.updatedAt = new Date();
    await this.sessionsRepository.save(session);

    return {
      message: 'Session refreshed',
      session,
    };
  }

  /**
   * HYBRID MODE: End tất cả sessions của user trên 1 device cụ thể
   * Dùng khi switch user trên cùng device
   */
  async endUserSessionsOnDevice(userId: string, deviceId: string) {
    const sessions = await this.sessionsRepository.find({
      where: { userId, deviceId, isActive: true },
    });

    if (sessions.length > 0) {
      const now = new Date();
      sessions.forEach(session => {
        session.isActive = false;
        session.endedAt = now;
      });
      await this.sessionsRepository.save(sessions);
    }

    return {
      message: `Ended ${sessions.length} session(s)`,
      count: sessions.length,
    };
  }

  /**
   * HYBRID MODE: Lấy tất cả sessions của user (cross-device)
   */
  async getUserSessions(userId: string) {
    const sessions = await this.sessionsRepository.find({
      where: { userId },
      relations: ['device'],
      order: { startedAt: 'DESC' },
    });

    return sessions;
  }

  /**
   * HYBRID MODE: Lấy tất cả sessions trên 1 device (multi-user)
   */
  async getDeviceSessions(deviceId: string) {
    const sessions = await this.sessionsRepository.find({
      where: { deviceId },
      relations: ['user'],
      order: { startedAt: 'DESC' },
    });

    return sessions;
  }
}
