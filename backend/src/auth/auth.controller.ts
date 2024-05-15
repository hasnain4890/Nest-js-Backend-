import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  ValidationPipe,
  UsePipes,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/dto';
import { ChangePasswordDto } from './dto/change-password';
import { ForgotPasswordDto } from './dto/forget-password';
import { VerifyOtpDto } from './dto/VerifyOtpDto';
import { HttpExceptionFilter } from '../error_handler';

@UseFilters(new HttpExceptionFilter())
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    return this.authService.loginUser(createUserDto);
  }

  @Get('all-users')
  async allUsers() {
    return this.authService.allUsers();
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<string> {
    return await this.authService.verifyOtpAndChangePassword(verifyOtpDto);
  }
}
