import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { returnUserObject } from './return-user.object';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async byId(id: number, selectObject: Prisma.UserSelect={}) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      },
      select: {
        ...returnUserObject,
        ...selectObject
      }
    })

    if(!user){
        throw new Error('User not found');
    }

    return user
  }

  async updateProfile(id: number, dto: any) {
    const isSameUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
  
    if (isSameUser && id !== isSameUser.id)
      throw new BadRequestException('Email already in use');
  
    const user = await this.byId(id);
  
    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        password: dto.password ? await hash(dto.password) : user.password
      }
    });
  }

  async getAllPhones() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        phone: true
      }
    });
  
    return users.map(user => ({
      id: user.id,
      phone: user.phone
    }));
  }
  
}
