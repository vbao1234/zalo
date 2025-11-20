import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { User } from '../users/entities/user.entity';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async registerDevice(registerDeviceDto: RegisterDeviceDto) {
    // Kiểm tra device đã tồn tại chưa
    const existingDevice = await this.devicesRepository.findOne({
      where: { deviceId: registerDeviceDto.deviceId },
    });

    if (existingDevice) {
      return {
        message: 'Device already registered',
        device: existingDevice,
      };
    }

    const device = this.devicesRepository.create(registerDeviceDto);
    await this.devicesRepository.save(device);

    return {
      message: 'Device registered successfully',
      device,
    };
  }

  async getDevice(deviceId: string) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId },
      relations: ['user'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  async assignUser(deviceId: string, userId: string) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Kiểm tra user có tồn tại không
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // HYBRID MODE: Bỏ check "User already assigned to another device"
    // Cho phép 1 user có thể được gán cho nhiều devices

    device.userId = userId;
    device.user = user;
    device.metadata = {
      ...device.metadata,
      lastAssignedAt: new Date().toISOString(),
      assignedBy: 'admin',
    };
    await this.devicesRepository.save(device);

    return {
      message: 'User assigned to device successfully',
      device,
    };
  }

  async updateStatus(deviceId: string, status: any) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    device.metadata = { ...device.metadata, ...status };
    await this.devicesRepository.save(device);

    return {
      message: 'Device status updated',
      device,
    };
  }

  /**
   * HYBRID MODE: Cập nhật device owner động
   * Được gọi khi user login/switch
   */
  async updateDeviceOwner(deviceId: string, userId: string) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const previousUserId = device.userId;
    device.userId = userId;
    device.metadata = {
      ...device.metadata,
      previousOwner: previousUserId,
      lastOwnerChange: new Date().toISOString(),
    };

    await this.devicesRepository.save(device);

    return {
      message: 'Device owner updated',
      device,
      previousUserId,
    };
  }

  /**
   * HYBRID MODE: Lấy danh sách users đã sử dụng device
   * Dựa vào sessions history
   */
  async getDeviceUsers(deviceId: string) {
    const device = await this.devicesRepository.findOne({
      where: { deviceId },
      relations: ['sessions', 'sessions.user'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Lấy unique users từ sessions
    const users = device.sessions
      .map(session => session.user)
      .filter((user, index, self) =>
        user && self.findIndex(u => u && u.id === user.id) === index
      );

    return {
      device: {
        id: device.id,
        deviceId: device.deviceId,
        brand: device.brand,
        model: device.model,
        currentOwner: device.userId,
      },
      users,
      totalUsers: users.length,
    };
  }

  /**
   * HYBRID MODE: Lấy tất cả devices của user
   */
  async getUserDevices(userId: string) {
    const devices = await this.devicesRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    return devices;
  }
}
