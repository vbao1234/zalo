import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZaloToken } from './entities/zalo-token.entity';
import { SaveTokensDto } from './dto/save-tokens.dto';

@Injectable()
export class ZaloTokensService {
  constructor(
    @InjectRepository(ZaloToken)
    private tokensRepository: Repository<ZaloToken>,
  ) {}

  /**
   * Save or update Zalo tokens for a user
   */
  async saveTokens(
    userId: string,
    dto: SaveTokensDto,
  ): Promise<ZaloToken> {
    const existing = await this.findByUser(userId);

    const expiresAt = new Date(Date.now() + dto.expiresIn * 1000);

    if (existing) {
      // Update existing tokens
      return this.tokensRepository.save({
        ...existing,
        accessToken: dto.accessToken,
        refreshToken: dto.refreshToken,
        expiresAt,
        zaloUserInfo: dto.zaloUserInfo || existing.zaloUserInfo,
        isActive: true,
      });
    }

    // Create new token record
    const token = this.tokensRepository.create({
      userId,
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresAt,
      zaloUserInfo: dto.zaloUserInfo,
      isActive: true,
    });

    return this.tokensRepository.save(token);
  }

  /**
   * Get valid access token for user (auto-refresh if expired)
   */
  async getValidToken(userId: string): Promise<string> {
    const token = await this.findByUser(userId);

    if (!token) {
      throw new NotFoundException('Zalo token not found for this user');
    }

    if (!token.isActive) {
      throw new BadRequestException('Zalo token has been revoked');
    }

    // Check if token is expired
    const now = new Date();
    if (now >= token.expiresAt) {
      // Token expired, need to refresh
      console.log(`Token expired for user ${userId}, refreshing...`);
      return this.refreshToken(userId);
    }

    return token.accessToken;
  }

  /**
   * Get token details for user
   */
  async getTokenDetails(userId: string): Promise<ZaloToken> {
    const token = await this.findByUser(userId);

    if (!token) {
      throw new NotFoundException('Zalo token not found for this user');
    }

    return token;
  }

  /**
   * Refresh expired token using refresh token
   */
  async refreshToken(userId: string): Promise<string> {
    const token = await this.findByUser(userId);

    if (!token) {
      throw new NotFoundException('Zalo token not found');
    }

    try {
      // Call Zalo OAuth API to refresh token
      const newTokens = await this.callZaloRefreshAPI(token.refreshToken);

      // Save new tokens
      await this.saveTokens(userId, {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
        zaloUserInfo: token.zaloUserInfo,
      });

      return newTokens.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new BadRequestException('Failed to refresh Zalo token');
    }
  }

  /**
   * Revoke tokens for user
   */
  async revokeTokens(userId: string): Promise<void> {
    const token = await this.findByUser(userId);

    if (token) {
      token.isActive = false;
      await this.tokensRepository.save(token);
    }
  }

  /**
   * Delete tokens for user
   */
  async deleteTokens(userId: string): Promise<void> {
    await this.tokensRepository.delete({ userId });
  }

  /**
   * Find token by user ID
   */
  private async findByUser(userId: string): Promise<ZaloToken | null> {
    return this.tokensRepository.findOne({
      where: { userId },
    });
  }

  /**
   * Call Zalo OAuth API to refresh access token
   * https://developers.zalo.me/docs/api/official-account-api/tai-lieu/xac-thuc-va-uy-quyen-post-28
   */
  private async callZaloRefreshAPI(refreshToken: string): Promise<any> {
    // TODO: Implement actual Zalo OAuth refresh API call
    // For now, return mock data

    // In production, you would do something like:
    // const response = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
    //   refresh_token: refreshToken,
    //   app_id: process.env.ZALO_APP_ID,
    //   grant_type: 'refresh_token',
    // });
    // return response.data;

    console.warn('⚠️  Using mock Zalo refresh API - implement actual API call in production');

    return {
      accessToken: `refreshed_${Date.now()}`,
      refreshToken: refreshToken, // Zalo might return new refresh token
      expiresIn: 86400, // 24 hours
    };
  }
}
