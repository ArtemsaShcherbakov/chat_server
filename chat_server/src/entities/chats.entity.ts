import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LinkChats } from './link-chats.entity';
import { Messages } from './messages.entity';
import { Users } from './users.entity';

@Entity('chat')
export class Chats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  link_id: number;

  @ManyToOne(() => Users, (user) => user.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => LinkChats, (link) => link.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'link_id' })
  link: LinkChats;

  @OneToMany(() => Messages, (message) => message.chat)
  messages: Messages[];
}
