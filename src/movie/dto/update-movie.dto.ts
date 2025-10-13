import { IsNotEmpty, IsOptional } from 'class-validator';

// enum MovieGenre {
//   Fantasy = 'fantasy',
//   Action = 'action',
// }
// @ValidatorConstraint()
// class PasswordValidator implements ValidatorConstraintInterface {
//   validate(password: string) {
//     return password.length > 4 && password.length <= 8;
//   }

//   defaultMessage() {
//     return '비밀번호의 길이는 4~8자 여야합니다. ($value)';
//   }
// }

// function IsPasswordValid(validateOptions?: ValidationOptions) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       options: validateOptions,
//       validator: PasswordValidator,
//     });
//   };
// }
export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  // null || undifined
  //@IsDefined()
  //@IsOptional()
  //@Equals('test')
  //@NotEquals('test')
  /// null || undefined || '' 이어야 한다.
  //@IsEmpty()
  //@IsNotEmpty()

  ///Array
  // @IsIn(['test', 'prod', 'dev']) 이 값들 중 하나이어야 한다.
  //@IsNotIn(['test', 'prod', 'dev']) // 이 값들이 아니어야 한다.

  //Type
  //@IsBoolean()
  //@IsString()
  //@IsNumber()
  //@IsInt()
  //@IsArray()
  //@IsEnum(MovieGenre)
  //@IsDateString()

  //숫자
  //@IsDivisibleBy(2)
  //@IsPositive()
  //@IsNegative()
  //@Min(100)
  //@Max(100)

  //문자
  //@Contains('test')
  //@NotContains('test')
  //@IsAlphanumeric() 알파벳과 숫자로 이루어져 있는가? 공백도 안됨
  //@IsCreditCard()
  //@IsHexColor()
  //@MaxLength(10)
  //@MinLength(2)
  //@IsUUID()
  //@IsLatLong() 위도 경도
  // @Validate(PasswordValidator)
  // @IsPasswordValid()
  // test: string;
}
