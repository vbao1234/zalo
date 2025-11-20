import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('session')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startSession(@Body() body: { accountId: string; deviceId: string }) {
    return this.sessionsService.startSession(body.accountId, body.deviceId);
  }

  @Post('end')
  @HttpCode(HttpStatus.OK)
  async endSession(@Body() body: { accountId: string }) {
    return this.sessionsService.endSession(body.accountId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshSession(@Body() body: { sessionId: string }) {
    return this.sessionsService.refreshSession(body.sessionId);
  }

  /**
   * HYBRID MODE: Switch user trên cùng device
   * End session cũ và start session mới trong 1 API call
   */
  @Post('switch')
  @HttpCode(HttpStatus.OK)
  async switchUser(
    @Body() body: { currentUserId: string; newUserId: string; deviceId: string }
  ) {
    // End session của user hiện tại
    if (body.currentUserId) {
      await this.sessionsService.endUserSessionsOnDevice(
        body.currentUserId,
        body.deviceId
      );
    }

    // Start session mới cho user mới
    const result = await this.sessionsService.startSession(
      body.newUserId,
      body.deviceId
    );

    return {
      message: 'User switched successfully',
      previousUser: body.currentUserId,
      currentUser: body.newUserId,
      session: result.session,
    };
  }

  /**
   * HYBRID MODE: Lấy tất cả sessions của user (multi-device)
   */
  @Get('user/:userId')
  async getUserSessions(@Param('userId') userId: string) {
    const sessions = await this.sessionsService.getUserSessions(userId);
    return {
      userId,
      sessions,
      totalDevices: sessions.length,
    };
  }

  /**
   * HYBRID MODE: Lấy tất cả sessions trên device (multi-user)
   */
  @Get('device/:deviceId')
  async getDeviceSessions(@Param('deviceId') deviceId: string) {
    const sessions = await this.sessionsService.getDeviceSessions(deviceId);
    return {
      deviceId,
      sessions,
      totalUsers: sessions.filter((s, i, arr) =>
        arr.findIndex(x => x.userId === s.userId) === i
      ).length,
    };
  }
}
