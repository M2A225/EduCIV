import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { StudentsModule } from './students/students.module';
import { PaymentsModule } from './payments/payments.module';
import { NotesModule } from './notes/notes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TimetablesModule } from './timetables/timetables.module';
import { SyncModule } from './sync/sync.module';
import { QueueModule } from './jobs/queue.module';
import { StorageService } from './storage/storage.service';
import { PrismaService } from './core/prisma.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    QueueModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    PaymentsModule,
    NotesModule,
    AttendanceModule,
    TimetablesModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService, StorageService],
  exports: [PrismaService],
})
export class AppModule {}
