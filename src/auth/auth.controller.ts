import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import TokenVerificationDto from './dtos/tokenVerification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authSevice: AuthService) {}

  @Post('google-authentication')
  async authenticateGoogle(
    @Body() tokenData: TokenVerificationDto,
    @Req() request: Request,
  ) {
    // const { accessTokenCookie, refreshTokenCookie, user } =
    return await this.authSevice.authenticateGoogle(tokenData.token);

    // request.res.setHeader('Set-Cookie', [
    //   accessTokenCookie,
    //   refreshTokenCookie,
    // ]);

    // return user;
  }
}
