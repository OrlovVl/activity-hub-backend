import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const candidate = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] }
    });

    if (candidate) throw new BadRequestException('Пользователь уже существует');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
      }
    });

    return this.generateAuthResponse(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Неверные учетные данные');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Неверные учетные данные');

    return this.generateAuthResponse(user.id);
  }

  private async generateAuthResponse(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { posts: true, followers: true, following: true } },
        favoriteSubcategories: true
      }
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');

    const stats = await this.usersService.getProfileStats(userId);
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    const { passwordHash, ...userData } = user;
    
    return {
      token,
      user: {
        ...userData,
        favoriteSubcategoryIds: user.favoriteSubcategories.map(s => s.subcategoryId),
        stats
      }
    };
  }
}