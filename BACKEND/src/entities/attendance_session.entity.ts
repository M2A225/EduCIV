import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class_id: string;

  @Column()
  subject_id: string;

  @Column()
  teacher_id: string;

  @Column()
  timetable_id: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  school_id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at: Date;
}
