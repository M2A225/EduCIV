import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('teacher_subjects')
export class TeacherSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacher_id: string;

  @Column()
  subject_id: string;

  @Column()
  class_id: string;

  @Column()
  school_id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at: Date;
}
