import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import TokenVerificationDto from './dtos/tokenVerification.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { JwtPayload } from './strategies /accessToken.strategy';
import { JwtRefreshPayload } from './strategies /refreshToken.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google-authentication')
  async authenticateGoogle(@Body() tokenData: TokenVerificationDto) {
    return this.authService.authenticateGoogle(tokenData.token);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request & { user: JwtRefreshPayload }) {
    return this.authService.refreshTokens(
      req.user.email,
      req.user.refreshToken,
    );
  }

  @Get('logout')
  logout(@Req() req: Request & { user: JwtPayload }) {
    this.authService.logout(req.user.email);

    req.res.status(200);
  }
}
