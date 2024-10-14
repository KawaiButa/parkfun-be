import { CanActivate, ExecutionContext, mixin, Type } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";

const RolesGuard = (...roles: string[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    constructor(private userService: UserService) {}
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const jwtService = new JwtService();
      const token = request.headers["authorization"] ?? "";
      const user = token ? jwtService.decode((token as string).substring(7)) : null;
      request.user = user;
      if (roles.length == 0) return true;
      if (!user) return;
      if (user.id && !roles.includes(user.role)) return false;
      return true;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RolesGuard;
