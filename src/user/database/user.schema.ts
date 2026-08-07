import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Providers } from './providers.enum'
import { Roles } from './roles.enum'
import { UserStatus } from './status.enum'

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id!: number

  @Column({ unique: true })
  email!: string

  @Column()
  name!: string

  @Column({ nullable: true })
  profile!: string

  @Column()
  provider!: Providers

  @Column({ unique: true })
  provider_sub!: string

  @Column()
  role!: Roles

  @Column()
  status!: UserStatus

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
