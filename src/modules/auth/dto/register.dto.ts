import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'nexus_dev', description: 'Уникальный никнейм' })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({ example: 'password123', description: 'Пароль (мин. 6 символов)' })
  @IsString()
  @MinLength(6)
  password!: string;
}