import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Chats } from './chats.entity';
import { Messages } from './messages.entity';

@Entity('user')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  name: string;

  // bcrypt hash; excluded from default selects so it never leaks into responses
  @Column({ select: false })
  password_hash: string;

  @Column({ default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until: Date | null;

  @OneToMany(() => Chats, (chat) => chat.user)
  chats: Chats[];

  @OneToMany(() => Messages, (message) => message.user)
  messages: Messages[];
}
