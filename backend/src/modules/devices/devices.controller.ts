import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('device')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(@Body() registerDeviceDto: RegisterDeviceDto) {
    return this.devicesService.registerDevice(registerDeviceDto);
  }

  @Get(':deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.devicesService.getDevice(deviceId);
  }

  @Post(':deviceId/assign-user')
  async assignUser(
    @Param('deviceId') deviceId: string,
    @Body() body: { userId: string },
  ) {
    return this.devicesService.assignUser(deviceId, body.userId);
  }

  @Post('status/update')
  async updateStatus(@Body() body: any) {
    return this.devicesService.updateStatus(body.deviceId, body.status);
  }
}
