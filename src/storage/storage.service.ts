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

  public async upload(
    file: Express.Multer.File,
    bucket: string = this.minioConfig.baseBucket,
  ) {
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
    const fileName = `${filename}`;
    const fileBuffer = file.buffer;
    this.client.putObject(
      bucket,
      fileName,
      fileBuffer,
      metaData,
      function (err, res) {
        console.log(err, res);
        if (err) {
          throw new HttpException(
            'Error uploading file',
            HttpStatus.BAD_REQUEST,
          );
        }
      },
    );

    const { endpoint, port } = this.minioConfig;
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    return {
      url: `${protocol}://${endpoint}:${port}/${bucket}/${filename}`,
    };
  }

  async delete(
    objetName: string,
    bucket: string = this.minioConfig.baseBucket,
  ) {
    this.client.removeObject(bucket, objetName, function (err, res) {
      if (err)
        throw new HttpException(
          'Oops Something wrong happend',
          HttpStatus.BAD_REQUEST,
        );
    });
  }
}
