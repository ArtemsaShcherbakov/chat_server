import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chats } from './chats.entity';

@Entity('link_chat')
export class LinkChats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_chat: string;

  @Column()
  chat_link: string;

  @CreateDateColumn()
  created_dt: Date;

  @OneToMany(() => Chats, (chat) => chat.link)
  chats: Chats[];
}
