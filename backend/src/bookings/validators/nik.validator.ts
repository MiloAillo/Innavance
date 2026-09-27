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
