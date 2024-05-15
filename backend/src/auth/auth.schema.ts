// src/user/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  otp: string;

  @Prop()
  otpExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash the user's password before saving it to the database
UserSchema.pre<UserDocument>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Random salt generation
  const salt = await bcrypt.genSalt(10);
  // Hashing the password with the salt
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
