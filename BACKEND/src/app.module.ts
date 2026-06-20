import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { RedisModule } from './common/redis.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { SetupGuard } from './auth/guards/setup.guard';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { PaymentsModule } from './payments/payments.module';
import { NotesModule } from './notes/notes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TimetablesModule } from './timetables/timetables.module';
import { BulletinModule } from './bulletins/bulletin.module';
import { SyncModule } from './sync/sync.module';
import { ParentsModule } from './parents/parents.module';
import { InvitationsModule } from './invitations/invitations.module';
import { IncidentsModule } from './incidents/incidents.module';
import { SubjectsModule } from './subjects/subjects.module';
import { CitiesModule } from './cities/cities.module';
import { PeriodsModule } from './periods/periods.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { SchoolGroupsModule } from './school-groups/school-groups.module';
import { PaymentPlansModule } from './payment-plans/payment-plans.module';
import { TeacherSubjectsModule } from './teacher-subjects/teacher-subjects.module';
import { BulkImportModule } from './bulk-import/bulk-import.module';
import { ProgressionModule } from './progression/progression.module';
import { QueueModule } from './jobs/queue.module';
import { StorageModule } from './storage/storage.module';
import { PrismaService } from './core/prisma.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          transport:
            config.get<string>('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: 60000,
          limit: config.get<string>('NODE_ENV') === 'production' ? 60 : 120,
        },
      ],
    }),
    RedisModule,
    QueueModule,
    StorageModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    PaymentsModule,
    NotesModule,
    AttendanceModule,
    TimetablesModule,
    BulletinModule,
    SyncModule,
    IncidentsModule,
    SubjectsModule,
    CitiesModule,
    PeriodsModule,
    SchoolYearsModule,
    SchoolGroupsModule,
    PaymentPlansModule,
    TeacherSubjectsModule,
    ParentsModule,
    InvitationsModule,
    BulkImportModule,
    ProgressionModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    AppService,
    { provide: APP_GUARD, useClass: SetupGuard },
  ],
  exports: [PrismaService, StorageModule],
})
export class AppModule {}
