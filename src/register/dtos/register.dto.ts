import { CreateAccountDto } from "src/account/dto/createAccount.dto";
import { CreateUserDto } from "src/user/dtos/user.dto";

export class RegisterDto extends CreateUserDto implements CreateAccountDto {
  email: string;
  password: string;
}
