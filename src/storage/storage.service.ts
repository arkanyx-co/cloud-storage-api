import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly minioConfig;

  public get client() {
    return this.minio.client;
  }

  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
  ) {
    this.minioConfig = {
      baseBucket: this.configService.get('MINIO_BUCKET'),
      endpoint: this.configService.get('MINIO_ENDPOINT'),
      port: this.configService.get('MINIO_PORT'),
    };
  }

  public upload(
    file: Express.Multer.File,
    bucket: string = this.minioConfig.baseBucket,
  ): Promise<{ filename: string; bucket: string }> {
    const temp_filename = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );
    const metaData = {
      'Content-Type': file.mimetype,
    };
    const filename = hashedFileName + ext;
    return new Promise((res, rej) => {
      this.client.putObject(
        bucket,
        filename,
        file.buffer,
        metaData,
        function (err) {
          if (err) {
            return rej(
              new HttpException('Error uploading file', HttpStatus.BAD_REQUEST),
            );
          }

          res({
            filename,
            bucket,
          });
        },
      );
    });
  }

  delete(filename: string, bucket: string = this.minioConfig.baseBucket) {
    return new Promise<void>((res, rej) => {
      this.client.removeObject(bucket, filename, function (err) {
        if (err) {
          return rej(
            new HttpException(
              'Oops Something wrong happend',
              HttpStatus.BAD_REQUEST,
            ),
          );
        }

        res();
      });
    });
  }
}
