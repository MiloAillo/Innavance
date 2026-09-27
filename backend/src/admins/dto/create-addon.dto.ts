import { IsNotEmpty, IsString, IsInt, Min, MaxLength } from 'class-validator';

export class CreateAddonDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  addon: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  borrowMaximum: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalStock: number;
}
