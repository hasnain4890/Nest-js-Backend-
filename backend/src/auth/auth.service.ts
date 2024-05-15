import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './auth.schema';
import { CreateUserDto } from './dto/dto';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/change-password';
import { ForgotPasswordDto } from './dto/forget-password';
import { VerifyOtpDto } from './dto/VerifyOtpDto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if the user already exists
    const userExists = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (userExists) {
      // Throw an exception if the user already exists
      throw new ConflictException('User already exists');
    }

    // Create a new user if not exists
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  //Login User
  async loginUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    // Check if the user exists
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    // Check if the password matches using bcrypt
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Incorrect Credentials');
    }

    return user;
  }

  //All Users
  async allUsers() {
    const allUsers = await this.userModel.find();

    return allUsers;
  }

  // Change Password
  async changePassword(changePasswordDto: ChangePasswordDto): Promise<string> {
    const { email, oldPassword, newPassword } = changePasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return 'Password changed successfully';
  }

  //  // forgetPassword
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User with the given email does not exist.');
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;

    // Sets OTP to expire in 2 minutes
    user.otpExpires = new Date(Date.now() + 120000);
    // Save the updated user record
    await user.save();

    return `OTP: ${otp} (valid for 2 minutes)`;
  }

  // Verify otp and change password route
  async verifyOtpAndChangePassword(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<string> {
    const { email, otp, newPassword } = verifyOtpDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Check if an OTP exists
    if (!user.otp) {
      throw new Error('No OTP exists.');
    }

    // Check if the OTP has expired
    if (new Date() > user.otpExpires) {
      throw new Error('OTP is expired.');
    }

    // Check if the provided OTP matches the stored OTP
    if (user.otp !== otp) {
      throw new Error('OTP does not match.');
    }

    // If all checks pass, proceed to change the password
    user.password = newPassword;
    user.otp = null; // Clear the OTP
    user.otpExpires = null;
    await user.save();

    return 'Password changed successfully.';
  }
}
