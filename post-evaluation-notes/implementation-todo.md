# Implementation TODO List - HYBRID APPROACH

## Overview
This document outlines the step-by-step implementation plan using a **hybrid approach**: complete database foundation first, then implement each feature vertically (backend + frontend together).

**Last Updated:** 2026-09-26  
**Version:** 3.0 - Hybrid Approach

---

## PHASE 1: DATABASE FOUNDATION (ALL SCHEMA CHANGES)

**Goal:** Complete all database schema changes and infrastructure setup before any feature implementation.

**Duration:** Week 1

---

### 1.1 Update Database Schema with Soft Delete and Inventory Tracking
**Priority:** CRITICAL  
**Dependencies:** None  
**Estimated Impact:** High - foundation for all features

**Changes:**
- [ ] Update `Addons` model in `schema.prisma`:
  ```prisma
  model Addons {
    id                Int                       @id @default(autoincrement())
    addon             String @db.VarChar(50)    
    price             Int
    borrowMaximum     Int
    totalStock        Int                       // NEW: Total inventory
    currentlyBorrowed Int        @default(0)   // NEW: Currently borrowed count
    isActive          Boolean    @default(true) // NEW: Soft delete flag
    
    roomsAddons       RoomsAddons[]
    bookingsAddons    BookingsAddons[]
  }
  ```

- [ ] Update `Rooms` model in `schema.prisma`:
  ```prisma
  model Rooms {
    id                  Int                       @id @default(autoincrement())
    accountId           String? @db.VarChar(225)  @unique
    name                String @db.VarChar(225)
    price               Int
    capacity            Int
    description         String @db.Text
    isAvailable         Boolean                   @default(true)
    smartDoorPin        String @db.VarChar(6)     @default("157359")
    smartDoorIsLocked   Boolean
    smartDoorIsOpened   Boolean
    electricityOutput   Float
    waterOutput         Float
    deletedAt           DateTime?                 // NEW: Soft delete timestamp
    
    features            RoomsFeatures[]
    roomsAddons         RoomsAddons[]
    bookings            Bookings[]
  }
  ```

- [ ] Update `Bookings` model - add all 14 fields:
  ```prisma
  model Bookings {
    id                      Int                         @id @default(autoincrement())
    room_id                 Int
    status                  BookingsStatus
    
    // Basic info (enhanced)
    fullName                String @db.VarChar(100)    // RENAMED from 'name'
    phoneNumber             String @db.VarChar(20)     // UPDATED length
    
    // NEW: Personal information
    nik                     String @db.VarChar(16)     // National ID (encrypted)
    idCardPhotoPath         String @db.Text            // File path to ID card photo
    birthDate               DateTime @db.Date          // Birth date
    sex                     Sex                        // Enum: MALE, FEMALE
    homeAddress             String @db.Text            // Home address
    
    // NEW: Professional information (optional)
    profession              String? @db.VarChar(100)   // Job/occupation
    workplaceSchool         String? @db.VarChar(200)   // Workplace or school name
    
    // NEW: Emergency contact
    emergencyContactName    String @db.VarChar(100)    // Emergency contact person
    emergencyContactNumber  String @db.VarChar(20)     // Emergency phone
    emergencyContactRelation String @db.VarChar(50)    // Relation (parent, sibling, etc)
    
    // Existing fields
    duration                Int
    price                   Int
    paymentMethod           String @db.VarChar(100)
    isAddonServed           Boolean
    isInnkeeperCalled       Boolean
    isAutoApprove           Boolean                  @default(false)
    checkoutGraceTime       Int?
    autoApproveTime         Int?
    createdAt               DateTime                    @default(now())
    updatedAt               DateTime?                   @updatedAt
    checkedInAt             DateTime?
    checkedOutAt            DateTime?
    
    bookingRoom             Rooms                       @relation(fields: [room_id], references: [id], onDelete: Restrict)
    bookingsAddons          BookingsAddons[]
    bookingsNotifications   BookingsNotifications[]
    
    @@index([nik])
    @@index([phoneNumber])
  }
  
  enum Sex {
    MALE
    FEMALE
  }
  ```

- [ ] Update foreign key constraints:
  ```prisma
  // In Bookings model - CHANGE from Cascade to Restrict
  bookingRoom  Rooms  @relation(fields: [room_id], references: [id], onDelete: Restrict)
  
  // In BookingsAddons model - CHANGE from Cascade to Restrict
  addonAddon   Addons @relation(fields: [addon_id], references: [id], onDelete: Restrict)
  ```

**Files to modify:**
- `backend/prisma/schema.prisma`

---

### 1.2 Create and Execute Database Migration
**Priority:** CRITICAL  
**Dependencies:** 1.1  
**Estimated Impact:** High - no features work without this

**Changes:**
- [ ] Create migration:
  ```bash
  cd backend
  npx prisma migrate dev --name post_evaluation_hybrid_changes
  ```

- [ ] Generate Prisma client:
  ```bash
  npx prisma generate
  ```

- [ ] Verify migration success:
  ```bash
  npx prisma migrate status
  ```

- [ ] Update seed data if needed:
  - Set `isActive = true` for all existing addons
  - Set `totalStock` values for existing addons
  - Ensure `currentlyBorrowed = 0` for all addons

**Files to modify:**
- `backend/prisma/seed.ts` (if needed)
- New migration files created automatically

**Notes:**
- Existing bookings will have NULL for new required fields - handle with default values or make optional initially
- Backup database before running migration in production

---

### 1.3 Set Up File Upload Infrastructure
**Priority:** HIGH  
**Dependencies:** None  
**Estimated Impact:** Medium - needed for ID card photos

**Changes:**
- [ ] Install TypeScript types:
  ```bash
  cd backend
  npm install --save-dev @types/multer
  ```

- [ ] Create uploads directory:
  ```bash
  New-Item -ItemType Directory -Path "backend/uploads" -Force
  New-Item -ItemType File -Path "backend/uploads/.gitkeep" -Force
  ```

- [ ] Create multer configuration file:
  ```typescript
  // backend/src/config/multer.config.ts
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  import { v4 as uuidv4 } from 'uuid';
  
  export const multerConfig = {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (jpg, jpeg, png) are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  };
  ```

- [ ] Create file validation pipe:
  ```typescript
  // backend/src/pipes/file-validation.pipe.ts
  import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
  
  @Injectable()
  export class FileValidationPipe implements PipeTransform {
    transform(value: any) {
      if (!value) {
        throw new BadRequestException('File is required');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (value.size > maxSize) {
        throw new BadRequestException('File size exceeds 5MB limit');
      }
      
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimes.includes(value.mimetype)) {
        throw new BadRequestException('Only JPG, JPEG, and PNG files are allowed');
      }
      
      return value;
    }
  }
  ```

- [ ] Add static file serving in `main.ts`:
  ```typescript
  // backend/src/main.ts
  import { NestFactory } from '@nestjs/core';
  import { AppModule } from './app.module';
  import { NestExpressApplication } from '@nestjs/platform-express';
  import { join } from 'path';
  
  async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    
    // Serve static files from uploads directory
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });
    
    // ... rest of your bootstrap code
    
    await app.listen(3000);
  }
  bootstrap();
  ```

- [ ] Add to `.gitignore`:
  ```
  # Uploads
  uploads/*
  !uploads/.gitkeep
  ```

**Files to create:**
- `backend/src/config/multer.config.ts`
- `backend/src/pipes/file-validation.pipe.ts`
- `backend/uploads/.gitkeep`

**Files to modify:**
- `backend/src/main.ts`
- `backend/.gitignore`

---

### 1.4 Implement NIK Encryption Service
**Priority:** HIGH  
**Dependencies:** None  
**Estimated Impact:** High - required for sensitive data security

**Changes:**
- [ ] Create encryption service:
  ```typescript
  // backend/src/helper/encryption.service.ts
  import { Injectable } from '@nestjs/common';
  import * as crypto from 'crypto';
  
  @Injectable()
  export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;
    
    constructor() {
      // Get encryption key from environment
      const encryptionKey = process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
      }
      this.key = Buffer.from(encryptionKey, 'hex');
    }
    
    encrypt(text: string): string {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      // Return IV + encrypted data
      return iv.toString('hex') + ':' + encrypted;
    }
    
    decrypt(encryptedText: string): string {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }
  }
  ```

- [ ] Register service in appropriate modules (will be used in bookings module)

**Files to create:**
- `backend/src/helper/encryption.service.ts`

---

### 1.5 Environment Configuration
**Priority:** HIGH  
**Dependencies:** 1.4  
**Estimated Impact:** Critical - required for encryption

**Changes:**
- [ ] Generate encryption key:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] Add to `.env.example`:
  ```env
  # Encryption
  ENCRYPTION_KEY=<your-32-byte-hex-key-here>
  
  # File Upload
  MAX_FILE_SIZE=5242880
  UPLOAD_PATH=./uploads
  ```

- [ ] Add to your actual `.env` file with real generated key

- [ ] Add validation in `main.ts`:
  ```typescript
  // backend/src/main.ts
  async function bootstrap() {
    // Validate required environment variables
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }
    
    // ... rest of bootstrap
  }
  ```

**Files to modify:**
- `backend/.env.example`
- `backend/.env` (your local copy)
- `backend/src/main.ts`

**IMPORTANT:** Save your encryption key securely! If you lose it, you cannot decrypt NIK data.

---

### 1.6 Update Seed Data for New Fields
**Priority:** MEDIUM  
**Dependencies:** 1.2  
**Estimated Impact:** Low - development convenience

**Changes:**
- [ ] Update `backend/src/var.ts`:
  ```typescript
  // Add totalStock to addons
  export const addons = [
    { addon: 'Extra Bed', price: 50000, borrowMaximum: 1, totalStock: 5, isActive: true },
    { addon: 'Hanger', price: 5000, borrowMaximum: 10, totalStock: 50, isActive: true },
    { addon: 'Body Cleaning Kit', price: 15000, borrowMaximum: 10, totalStock: 30, isActive: true },
    { addon: 'Towel', price: 10000, borrowMaximum: 10, totalStock: 50, isActive: true },
  ];
  ```

- [ ] Update `backend/prisma/seed.ts` to include new fields when seeding

**Files to modify:**
- `backend/src/var.ts`
- `backend/prisma/seed.ts`

---

### ✅ PHASE 1 CHECKPOINT

**Before moving to Feature 1, verify:**
- [ ] Database migration completed successfully
- [ ] Prisma client regenerated
- [ ] Uploads directory created
- [ ] File upload config working
- [ ] Encryption service working (test encrypt/decrypt)
- [ ] ENCRYPTION_KEY set in environment
- [ ] Backend builds successfully: `npm run build`
- [ ] No TypeScript errors

**Test Phase 1:**
```bash
cd backend
npm run build
npm run start:dev
# Should start without errors
```

---

## FEATURE 1: BOOKING ENHANCEMENT (Backend + Frontend)

**Goal:** Complete 14-field booking system with ID card upload and NIK encryption.

**Duration:** Week 2

---

### Feature 1 - Backend: Update Booking DTO
**Priority:** HIGH  
**Dependencies:** Phase 1 complete  
**Estimated Impact:** High

**Changes:**
- [ ] Create custom validators:
  ```typescript
  // backend/src/bookings/validators/nik.validator.ts
  import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
  
  export function IsNIK(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isNIK',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            return typeof value === 'string' && /^\d{16}$/.test(value);
          },
          defaultMessage(args: ValidationArguments) {
            return 'NIK must be exactly 16 digits';
          },
        },
      });
    };
  }
  ```

  ```typescript
  // backend/src/bookings/validators/phone-id.validator.ts
  import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
  
  export function IsPhoneNumberID(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isPhoneNumberID',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            // Indonesian phone: +62 or 0, then 8-13 digits
            return typeof value === 'string' && /^(\+62|62|0)[0-9]{8,13}$/.test(value);
          },
          defaultMessage(args: ValidationArguments) {
            return 'Phone number must be a valid Indonesian phone number';
          },
        },
      });
    };
  }
  ```

- [ ] Update `book-body.dto.ts`:
  ```typescript
  // backend/src/bookings/dto/book-body.dto.ts
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
  ```

**Files to create:**
- `backend/src/bookings/validators/nik.validator.ts`
- `backend/src/bookings/validators/phone-id.validator.ts`

**Files to modify:**
- `backend/src/bookings/dto/book-body.dto.ts`

---

### Feature 1 - Backend: File Upload Endpoint
**Priority:** HIGH  
**Dependencies:** Feature 1 Backend DTO  
**Estimated Impact:** High

**Changes:**
- [ ] Add file upload endpoint to bookings controller:
  ```typescript
  // backend/src/bookings/bookings.controller.ts
  import { 
    Controller, 
    Post, 
    UploadedFile, 
    UseInterceptors,
    BadRequestException 
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { multerConfig } from '../config/multer.config';
  import { FileValidationPipe } from '../pipes/file-validation.pipe';
  
  @Controller('bookings')
  export class BookingsController {
    // ... existing endpoints
    
    @Post('upload-id-card')
    @UseInterceptors(FileInterceptor('file', multerConfig))
    uploadIdCard(@UploadedFile(new FileValidationPipe()) file: Express.Multer.File) {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      return {
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
      };
    }
  }
  ```

**Files to modify:**
- `backend/src/bookings/bookings.controller.ts`

---

### Feature 1 - Backend: Update Booking Service
**Priority:** HIGH  
**Dependencies:** Feature 1 Backend DTO, File Upload  
**Estimated Impact:** High

**Changes:**
- [ ] Inject EncryptionService into BookingsService:
  ```typescript
  // backend/src/bookings/bookings.service.ts
  import { EncryptionService } from '../helper/encryption.service';
  
  @Injectable()
  export class BookingsService {
    constructor(
      private readonly prisma: PrismaService,
      @InjectQueue('booking-queue') private readonly bookingQueue: Queue,
      private readonly encryptionService: EncryptionService, // NEW
    ) {}
    
    // ... rest of service
  }
  ```

- [ ] Update `book()` method to handle new fields:
  ```typescript
  async book(bookBodyDto: BookBodyDto) {
    // ... existing validation code ...
    
    // Encrypt NIK before storing
    const encryptedNik = this.encryptionService.encrypt(bookBodyDto.nik);
    
    // ... existing price calculation ...
    
    // Create booking with new fields
    const booking = await this.prisma.$transaction(async (tx) => {
      const [createdBooking] = await Promise.all([
        tx.bookings.create({
          data: {
            room_id: room.id,
            status: waitForApproval ? 'on_hold' : 'checked_in',
            
            // Basic info
            fullName: bookBodyDto.full_name,
            phoneNumber: bookBodyDto.phone_number,
            
            // Personal info (NEW)
            nik: encryptedNik,
            idCardPhotoPath: bookBodyDto.id_card_photo_path,
            birthDate: new Date(bookBodyDto.birth_date),
            sex: bookBodyDto.sex,
            homeAddress: bookBodyDto.home_address,
            
            // Professional info (NEW)
            profession: bookBodyDto.profession,
            workplaceSchool: bookBodyDto.workplace_school,
            
            // Emergency contact (NEW)
            emergencyContactName: bookBodyDto.emergency_contact_name,
            emergencyContactNumber: bookBodyDto.emergency_contact_number,
            emergencyContactRelation: bookBodyDto.emergency_contact_relation,
            
            // Booking details
            duration: bookBodyDto.duration,
            price: price,
            isAutoApprove: adminSettings?.isAutoApprove,
            autoApproveTime: adminSettings?.autoApproveTime,
            paymentMethod: paymentMethod,
            isAddonServed: bookBodyDto.addons.length === 0 ? true : false,
            isInnkeeperCalled: false,
  
            bookingsAddons: {
              createMany: {
                data: addonsToCreate,
              },
            },
          },
        }),
        tx.rooms.update({
          where: { id: room.id },
          data: { isAvailable: false },
        }),
      ]);
  
      // ... rest of transaction logic
      
      return createdBooking;
    });
    
    return {
      booking_id: booking.id,
      room_name: room.name,
      duration: bookBodyDto.duration,
      price: price,
      addons: responseAddons,
      wait_for_approval: waitForApproval,
    };
  }
  ```

- [ ] Update `detail()` method to decrypt NIK:
  ```typescript
  async detail(bookingId: number) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
      select: {
        room_id: true,
        fullName: true,
        phoneNumber: true,
        nik: true, // Will be encrypted
        birthDate: true,
        sex: true,
        homeAddress: true,
        profession: true,
        workplaceSchool: true,
        emergencyContactName: true,
        emergencyContactNumber: true,
        emergencyContactRelation: true,
        idCardPhotoPath: true,
        duration: true,
        price: true,
        paymentMethod: true,
        isAutoApprove: true,
        status: true,
        autoApproveTime: true,
        createdAt: true,
        bookingRoom: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!booking)
      throw new NotFoundException(
        "booking data with id specified doesn't exist",
      );
    
    // Decrypt NIK for display
    const decryptedNik = this.encryptionService.decrypt(booking.nik);
  
    return {
      room_id: booking.room_id,
      full_name: maskData.maskStringV2(booking.fullName, {
        unmaskedStartCharacters: 1,
        unmaskedEndCharacters: 2,
      }),
      phone_number: maskData.maskPhone(booking.phoneNumber, {
        unmaskedStartDigits: 3,
        unmaskedEndDigits: 3,
      }),
      nik: maskData.maskStringV2(decryptedNik, {
        unmaskedStartCharacters: 4,
        unmaskedEndCharacters: 4,
      }),
      birth_date: booking.birthDate,
      sex: booking.sex,
      home_address: booking.homeAddress,
      profession: booking.profession,
      workplace_school: booking.workplaceSchool,
      emergency_contact_name: booking.emergencyContactName,
      emergency_contact_number: booking.emergencyContactNumber,
      emergency_contact_relation: booking.emergencyContactRelation,
      id_card_photo_path: booking.idCardPhotoPath,
      status: booking.status,
      duration: booking.duration,
      price: maskData.maskStringV2(booking.price.toString()),
      payment_method: booking.paymentMethod,
      room_name: booking.bookingRoom.name,
      is_auto_approve: booking.isAutoApprove,
      auto_approve_time: booking.autoApproveTime,
      created_at: booking.createdAt,
    };
  }
  ```

- [ ] Register EncryptionService in BookingsModule:
  ```typescript
  // backend/src/bookings/bookings.module.ts
  import { EncryptionService } from '../helper/encryption.service';
  
  @Module({
    // ...
    providers: [BookingsService, EncryptionService],
    // ...
  })
  export class BookingsModule {}
  ```

**Files to modify:**
- `backend/src/bookings/bookings.service.ts`
- `backend/src/bookings/bookings.module.ts`

---

### Feature 1 - Backend: Addon Inventory Management
**Priority:** HIGH  
**Dependencies:** Feature 1 Backend Service  
**Estimated Impact:** High

**Changes:**
- [ ] Update addon validation in `book()` method:
  ```typescript
  // In bookings.service.ts book() method
  
  // NEW: Check both borrowMaximum AND available stock
  bookBodyDto.addons.forEach((addon) => {
    if (!roomAddonsId.includes(addon.id))
      throw new UnauthorizedException(`addon_id ${addon.id} isn't available`);
  
    const addonData = roomAddons[addon.id];
    
    // Check per-booking limit
    if (addon.count > addonData.borrowMaximum)
      throw new UnauthorizedException(
        `addon_id ${addon.id} exceed maximum borrow allowed (${addonData.borrowMaximum})`,
      );
    
    // NEW: Check available stock
    const availableStock = addonData.totalStock - addonData.currentlyBorrowed;
    if (addon.count > availableStock)
      throw new UnauthorizedException(
        `addon_id ${addon.id} insufficient stock. Available: ${availableStock}, Requested: ${addon.count}`,
      );
  
    price += addonData.price * addon.count;
  
    responseAddons.push({
      addon_name: addonData.addon,
      count: addon.count,
      price: addonData.price * addon.count,
    });
  });
  ```

- [ ] Increment `currentlyBorrowed` on booking creation:
  ```typescript
  // In bookings.service.ts book() method, inside transaction
  
  const booking = await this.prisma.$transaction(async (tx) => {
    const [createdBooking] = await Promise.all([
      tx.bookings.create({
        // ... booking data
      }),
      tx.rooms.update({
        where: { id: room.id },
        data: { isAvailable: false },
      }),
      // NEW: Increment currentlyBorrowed for each addon
      ...bookBodyDto.addons.map((addon) =>
        tx.addons.update({
          where: { id: addon.id },
          data: {
            currentlyBorrowed: {
              increment: addon.count,
            },
          },
        }),
      ),
    ]);
    
    // ... rest of transaction
  });
  ```

- [ ] Decrement `currentlyBorrowed` on checkout:
  ```typescript
  // In bookings.service.ts checkedOutWithTransaction() method
  
  async checkedOutWithTransaction(
    tx: any,
    room_name: string,
    room_id: number,
    booking_id: number,
    phone_number: string,
    smartDoorDefaultPin: string,
  ) {
    // Get booking with addons
    const booking = await tx.bookings.findUnique({
      where: { id: booking_id },
      include: {
        bookingsAddons: true,
      },
    });
    
    await tx.rooms.update({
      where: { id: room_id },
      data: {
        smartDoorPin: smartDoorDefaultPin,
        accountId: null,
        isAvailable: true,
      },
    });
  
    await tx.bookings.update({
      where: { id: booking_id },
      data: { 
        status: 'checked_out',
        checkedOutAt: new Date(),
      },
    });
    
    // NEW: Decrement currentlyBorrowed for each addon
    for (const bookingAddon of booking.bookingsAddons) {
      await tx.addons.update({
        where: { id: bookingAddon.addon_id },
        data: {
          currentlyBorrowed: {
            decrement: bookingAddon.count,
          },
        },
      });
    }
  
    await axios.post(
      `${process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'}/send`,
      {
        phone_number: phone_number,
        message: `You have checked out from ${room_name} at Innavance.\nThe door PIN and Dashboard is now unusable.\n\nThank you for choosing us, we always welcome you and are excited to see you again! 😉\n`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
    );
  }
  ```

- [ ] Also update `checkedOut()` method with same decrement logic

**Files to modify:**
- `backend/src/bookings/bookings.service.ts`

---

### Feature 1 - Backend: Restrict Booking to Admin/Staff Only
**Priority:** HIGH  
**Dependencies:** Feature 1 Backend complete  
**Estimated Impact:** Medium

**Changes:**
- [ ] Update booking controller to require authentication:
  ```typescript
  // backend/src/bookings/bookings.controller.ts
  import { UseGuards } from '@nestjs/common';
  import { JwtAuthGuard } from '../admins/guard/jwt-auth.guard'; // Adjust path as needed
  
  @Controller('bookings')
  export class BookingsController {
    // ... existing code
    
    @Post()
    @UseGuards(JwtAuthGuard) // NEW: Require authentication
    book(@Body() bookBodyDto: BookBodyDto) {
      return this.bookingsService.book(bookBodyDto);
    }
    
    // Keep detail endpoint public for status checking
    @Get(':id')
    detail(@Param('id', ParseIntPipe) id: number) {
      return this.bookingsService.detail(id);
    }
  }
  ```

**Files to modify:**
- `backend/src/bookings/bookings.controller.ts`

**Note:** User booking page will be removed in frontend, but endpoint is now secured.

---

### ✅ Feature 1 Backend CHECKPOINT

**Verify before moving to frontend:**
- [ ] Backend builds successfully: `npm run build`
- [ ] No TypeScript errors
- [ ] Can upload ID card photo via POST `/bookings/upload-id-card`
- [ ] Can create booking with 14 fields (authenticated)
- [ ] NIK is encrypted in database
- [ ] Addon stock decrements on booking
- [ ] Addon stock increments on checkout
- [ ] Cannot book if insufficient addon stock
- [ ] Booking endpoint requires authentication

**Test commands:**
```bash
cd backend
npm run build
npm run start:dev

# Test file upload
# Use Postman/Thunder Client to test endpoints
```

---

### Feature 1 - Frontend: Admin Booking Form
**Priority:** HIGH  
**Dependencies:** Feature 1 Backend complete  
**Estimated Impact:** High

**Changes:**
- [ ] Create booking form component
- [ ] Implement 14-field form with validation
- [ ] Add file upload for ID card
- [ ] Integrate with backend endpoints
- [ ] Add success/error handling

**(Frontend implementation details to be added based on your frontend framework - React/Vue/Angular)**

**Files to create:**
- `frontend/src/pages/admin/CreateBooking.tsx` (or .vue/.jsx)
- `frontend/src/components/admin/BookingForm.tsx`

---

### Feature 1 - Frontend: Remove User Self-Booking
**Priority:** HIGH  
**Dependencies:** None  
**Estimated Impact:** Medium

**Changes:**
- [ ] Remove or comment out user booking route
- [ ] Remove user booking page/component
- [ ] Update navigation to remove booking link
- [ ] Keep status page accessible (public)

**Files to modify:**
- Frontend routing configuration
- User booking components (remove/disable)
- Navigation components

---

### ✅ FEATURE 1 COMPLETE

**Final verification:**
- [ ] Backend builds and runs without errors
- [ ] Frontend builds and runs without errors
- [ ] Can upload ID card photo
- [ ] Admin can create booking with all 14 fields
- [ ] NIK is encrypted and decryptable
- [ ] Addon stock tracking works
- [ ] Users cannot self-book
- [ ] Status page still accessible
- [ ] All validations working

---

## FEATURE 2: ROOM MANAGEMENT (Backend + Frontend)

**Goal:** Complete room CRUD with soft delete and force checkout.

**Duration:** Week 3

---

### Feature 2 - Backend: Room CRUD Endpoints
**Priority:** MEDIUM  
**Dependencies:** Phase 1 complete  
**Estimated Impact:** Medium

**Changes:**
- [ ] Create DTOs for room management
- [ ] Add room CRUD endpoints to admin controller
- [ ] Implement room creation logic
- [ ] Implement room update logic
- [ ] Implement room soft deletion logic
- [ ] Add manager-only role guards

**(Detailed implementation to continue...)**

---

## FEATURE 3: ADDON MANAGEMENT (Backend + Frontend)

**Goal:** Complete addon CRUD with soft delete and room relationships.

**Duration:** Week 4

---

### Feature 3 - Backend: Addon CRUD Endpoints
**Priority:** MEDIUM  
**Dependencies:** Phase 1 complete  
**Estimated Impact:** Medium

**(Detailed implementation to continue...)**

---

## PHASE 5: TESTING & DOCUMENTATION

**Goal:** Comprehensive testing and documentation updates.

**Duration:** Week 5

---

**(More features to be detailed as we progress...)**

---

## Progress Tracking

Mark tasks as complete by changing `[ ]` to `[x]`.

**Current Status:** Phase 1 - Database Foundation  
**Last Updated:** 2026-09-26  
**Next Task:** 1.1 - Update Database Schema
