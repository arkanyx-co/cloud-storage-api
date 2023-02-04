import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { StorageModule } from '../storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([FileEntity])],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
