import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../entities';

// Refresh tokens. Only a SHA-256 hash is stored, so a DB leak does not expose live sessions.
@Entity('token')
export class Tokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Index({ unique: true })
  @Column()
  token_hash: string;

  @Column({ type: 'timestamptz' })
  expires_dt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revoked_dt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_dt: Date;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
