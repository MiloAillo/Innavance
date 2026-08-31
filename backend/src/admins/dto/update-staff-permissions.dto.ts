import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateStaffPermissionsDto {
  @IsBoolean()
  @IsOptional()
  is_staff_allowed_to_approve: boolean;

  @IsBoolean()
  @IsOptional()
  is_staff_allowed_to_force_checkout: boolean;

  @IsBoolean()
  @IsOptional()
  is_staff_allowed_to_dissmiss_call: boolean;
}
