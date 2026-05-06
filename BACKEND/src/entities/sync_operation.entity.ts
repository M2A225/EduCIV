import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_operations')
export class SyncOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_operation_id: string;

  @Column()
  entity: string;

  @Column({ nullable: true })
  entity_id: string;

  @Column('jsonb')
  payload: any;

  @Column()
  school_id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;
}
