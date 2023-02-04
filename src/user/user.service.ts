import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  getUser(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: { files: true },
    });
  }

  async create({ email }: { email: string }) {
    const user = this.userRepository.create({ email });

    await this.userRepository.save(user);

    return user;
  }

  updateRefreshToken(email: string, refreshToken: string) {
    return this.userRepository.update({ email }, { refreshToken });
  }
}
