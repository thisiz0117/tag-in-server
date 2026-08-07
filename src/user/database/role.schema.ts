import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./user.schema";

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: 'user' | 'admin'

  @OneToMany(() => Users, (user) => user.role_id)
  users!: Users[]
}