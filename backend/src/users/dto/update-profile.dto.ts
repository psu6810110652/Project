// update-profile.dto.ts
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsString() nameSurname?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() occupation?: string;
  @IsOptional() @IsEmail()  email?: string;
  @IsOptional() @IsString() houseNumber?: string;
  @IsOptional() @IsString() dormRoom?: string;
  @IsOptional() @IsString() streetSoi?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() subDistrict?: string;
  @IsOptional() @IsString() postalCode?: string;
}