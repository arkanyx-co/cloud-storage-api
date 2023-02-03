import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { google, Auth } from 'googleapis';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  oauthClient: Auth.OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async authenticateGoogle(token: string) {
    const { email } = await this.oauthClient.getTokenInfo(token);
    return this.handleOauth(email);
  }

  async handleOauth(email: string) {
    const user = await this.userService.getUser(email);

    if (user) {
      return this.signIn(user);
    }

    return this.signUp(email);
  }

  async signUp(email: string) {
    const newUser = await this.userService.create({ email });
    const tokens = await this.getTokens(newUser.id, newUser.email);

    await this.userService.updateRefreshToken(
      newUser.email,
      await argon2.hash(tokens.refreshToken),
    );

    return tokens;
  }

  async signIn(user: UserEntity) {
    const tokens = await this.getTokens(user.id, user.email);

    await this.userService.updateRefreshToken(
      user.email,
      await argon2.hash(tokens.refreshToken),
    );

    return tokens;
  }

  async logout(email: string) {
    return this.userService.updateRefreshToken(email, null);
  }

  async refreshTokens(email: string, refreshToken: string) {
    const user = await this.userService.getUser(email);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.userService.updateRefreshToken(
      user.email,
      await argon2.hash(tokens.refreshToken),
    );

    return tokens;
  }

  async getTokens(id: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          id,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
