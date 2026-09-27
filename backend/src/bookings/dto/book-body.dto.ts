import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsNIK } from '../validators/nik.validator';
import { IsPhoneNumberID } from '../validators/phone-id.validator';

enum SexEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class BookBodyDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  room_id!: number;

  // Basic Information
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  full_name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumberID()
  phone_number!: string;

  // Personal Information
  @IsNotEmpty()
  @IsString()
  @MaxLength(16)
  @IsNIK()
  nik!: string;

  @IsNotEmpty()
  @IsString()
  id_card_photo_path!: string; // Will be set after file upload

  @IsNotEmpty()
  @IsDateString()
  birth_date!: string;

  @IsNotEmpty()
  @IsEnum(SexEnum)
  sex!: SexEnum;

  @IsNotEmpty()
  @IsString()
  home_address!: string;

  // Professional Information (Optional)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  profession?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  workplace_school?: string;

  // Emergency Contact
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  emergency_contact_name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @IsPhoneNumberID()
  emergency_contact_number!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  emergency_contact_relation!: string;

  // Booking Details
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Max(9999)
  duration!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  payment_method!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddonItemsDto)
  addons!: AddonItemsDto[];
}

class AddonItemsDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsInt()
  @Min(1)
  count!: number;
}
