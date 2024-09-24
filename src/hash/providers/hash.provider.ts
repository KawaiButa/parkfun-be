import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class BcryptHashProvider {
  static hash(value: string): string {
    return bcrypt.hashSync(value, 10);
  }

  static isMatch(value: string, hash: string): boolean {
    return bcrypt.compareSync(value, hash);
  }
}
