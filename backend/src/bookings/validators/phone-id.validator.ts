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
