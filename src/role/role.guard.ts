import { CanActivate, ExecutionContext, mixin, Type } from "@nestjs/common";

const RolesGuard = (...roles: string[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const { user } = request;
      return roles.includes(user.role.name);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RolesGuard;
