import { Tokens } from '../auth/entities/tokens.entity';
import { Chats, LinkChats, Messages, Users } from '../entities';

// Single list shared by the app (app.module.ts) and the TypeORM CLI (data-source.ts)
export const entities = [Users, Chats, LinkChats, Messages, Tokens];
