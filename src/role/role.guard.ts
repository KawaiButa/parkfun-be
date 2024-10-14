import { CanActivate, ExecutionContext, mixin, Type } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

const RolesGuard = (...roles: string[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const jwtService = new JwtService();
      const token = request.headers["authorization"];
      const user = token ? jwtService.decode(token) : null;
      request.user = user;
      if (roles.length == 0) return true;
      if (user.id && !roles.includes(user.role)) return false;
      return true;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RolesGuard;
