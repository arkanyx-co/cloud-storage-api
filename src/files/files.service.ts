import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { FileEntity } from './file.entity';

@Injectable()
export class FilesService {
  constructor(
    private readonly storageService: StorageService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly configService: ConfigService,
  ) {}

  async getFiles(user: UserEntity) {
    return user.files.map(
      ({ filename, bucket }) =>
        `http://localhost:3000/files/${bucket}/${filename}`,
    );
  }

  async getFile(filename: string, bucket: string, user: UserEntity) {
    const file = user.files.find(
      (file) => file.filename === filename && file.bucket === bucket,
    );

    if (!file) {
      throw new ForbiddenException('Access denied');
    }

    const endpoint = this.configService.get('MINIO_ENDPOINT');
    const port = this.configService.get('MINIO_PORT');

    return axios.get(`http://${endpoint}:${port}/${bucket}/${filename}`, {
      responseType: 'stream',
    });
  }

  async uploadSingle(file: Express.Multer.File, user: UserEntity) {
    const { filename, bucket } = await this.storageService.upload(file);
    const fileEntity = this.fileRepository.create({
      filename,
      bucket,
      user,
    });

    await this.fileRepository.save(fileEntity);

    return {
      filename,
      bucket,
      url: `http://localhost:3000/files/${bucket}/${filename}`,
    };
  }
}
