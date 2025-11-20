import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ZaloTokensService } from './zalo-tokens.service';
import { SaveTokensDto } from './dto/save-tokens.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('zalo-tokens')
@UseGuards(JwtAuthGuard)
export class ZaloTokensController {
  constructor(private readonly tokensService: ZaloTokensService) {}

  /**
   * Save Zalo tokens after login
   * POST /zalo-tokens/save
   */
  @Post('save')
  async saveTokens(@Body() dto: SaveTokensDto, @Request() req) {
    const token = await this.tokensService.saveTokens(req.user.id, dto);

    return {
      message: 'Zalo tokens saved successfully',
      expiresAt: token.expiresAt,
    };
  }

  /**
   * Get current user's valid token (auto-refreshes if expired)
   * GET /zalo-tokens/current
   */
  @Get('current')
  async getCurrentUserToken(@Request() req) {
    const accessToken = await this.tokensService.getValidToken(req.user.id);

    return {
      accessToken,
      message: 'Token is valid',
    };
  }

  /**
   * Get token details for current user
   * GET /zalo-tokens/details
   */
  @Get('details')
  async getTokenDetails(@Request() req) {
    const token = await this.tokensService.getTokenDetails(req.user.id);

    // Don't expose actual tokens in details endpoint
    return {
      userId: token.userId,
      zaloUserInfo: token.zaloUserInfo,
      expiresAt: token.expiresAt,
      isActive: token.isActive,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt,
    };
  }

  /**
   * Manually refresh token
   * POST /zalo-tokens/refresh
   */
  @Post('refresh')
  async refreshToken(@Request() req) {
    const accessToken = await this.tokensService.refreshToken(req.user.id);

    return {
      accessToken,
      message: 'Token refreshed successfully',
    };
  }

  /**
   * Revoke tokens (soft delete - mark as inactive)
   * POST /zalo-tokens/revoke
   */
  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  async revokeTokens(@Request() req) {
    await this.tokensService.revokeTokens(req.user.id);

    return {
      message: 'Zalo tokens revoked successfully',
    };
  }

  /**
   * Delete tokens (hard delete)
   * DELETE /zalo-tokens
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteTokens(@Request() req) {
    await this.tokensService.deleteTokens(req.user.id);

    return {
      message: 'Zalo tokens deleted successfully',
    };
  }
}
