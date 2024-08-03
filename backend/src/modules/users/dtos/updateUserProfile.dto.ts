import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  registerDecorator,
  validateSync,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneProperty', async: false })
class AtLeastOnePropertyConstraint implements ValidatorConstraintInterface {
  validate(object: Record<string, unknown>) {
    return Object.values(object).some(
      (value) => value !== undefined && value !== null,
    );
  }

  defaultMessage() {
    return 'At least one property (username or password) must be provided for update.';
  }
}

function AtLeastOneProperty(validationOptions?: ValidationOptions) {
  // Define a type for a class constructor
  type Constructor<T> = new (...args: unknown[]) => T;

  return function (constructor: Constructor<unknown>) {
    const original = constructor.prototype.constructor;

    constructor.prototype.constructor = function (...args: any[]) {
      const instance = new original(...args);
      const errors = validateSync(instance, { skipMissingProperties: true });
      if (errors.length > 0) {
        throw new Error(
          errors.map((e) => Object.values(e.constraints)).join(', '),
        );
      }
      return instance;
    };

    registerDecorator({
      name: 'atLeastOneProperty',
      target: constructor,
      propertyName: '',
      options: validationOptions,
      validator: AtLeastOnePropertyConstraint,
    });
  };
}

@AtLeastOneProperty()
export class UpdateUserProfileDto {
  @IsOptional()
  @IsString({ message: 'Username must be a string!' })
  @IsNotEmpty({ message: 'Username should not be empty if provided!' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string!' })
  @IsNotEmpty({ message: 'Password should not be empty if provided!' })
  @MinLength(8, { message: 'Password must be at least 8 characters long!' })
  // Uncomment this if you want to enforce password complexity
  // @Matches(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}/, {
  //   message: 'Password must include uppercase, lowercase, a number, and a special character!',
  // })
  password?: string;
}
