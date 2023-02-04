import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { UserEntity } from 'src/user/user.entity';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: UserEntity },
  ) {
    return this.filesService.uploadSingle(file, req.user);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  listFiles(@Req() req: Request & { user: UserEntity }) {
    return this.filesService.getFiles(req.user);
  }

  @Get('/:bucket/:file')
  @UseGuards(AccessTokenGuard)
  async getFile(
    @Req() req: Request & { user: UserEntity },
    @Res() res: Response,
    @Param('bucket') bucket: string,
    @Param('file') filename: string,
  ) {
    const stream = await this.filesService.getFile(filename, bucket, req.user);
    stream.data.pipe(res);
  }
}
