import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZaloTokensController } from './zalo-tokens.controller';
import { ZaloTokensService } from './zalo-tokens.service';
import { ZaloToken } from './entities/zalo-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ZaloToken])],
  controllers: [ZaloTokensController],
  providers: [ZaloTokensService],
  exports: [ZaloTokensService], // Export for use in other modules
})
export class ZaloTokensModule {}
