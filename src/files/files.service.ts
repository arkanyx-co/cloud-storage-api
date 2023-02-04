import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FilesService {
  constructor(private minioClientService: StorageService) {}

  async uploadSingle(file: Express.Multer.File) {
    const uploaded_file = await this.minioClientService.upload(file);

    return {
      file_url: uploaded_file.url,
      message: 'Successfully uploaded to MinIO S3',
    };
  }
}
