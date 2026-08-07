import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Roles } from './role.schema'

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
  provider!: 'google' | 'naver'

  @Column({ unique: true })
  provider_sub!: string

  @ManyToOne(() => Roles, (role) => role.users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  role_id!: Roles

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
