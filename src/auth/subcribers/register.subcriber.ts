import { Injectable } from "@nestjs/common";
import { User } from "src/auth/entities/user.entity";
import { BcryptHashProvider } from "src/auth/providers/hash.provider";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";

@EventSubscriber()
@Injectable()
export class RegisterSubcriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }
  async beforeInsert({ entity }: InsertEvent<User>): Promise<void> {
    if (entity.password) {
      entity.password = await BcryptHashProvider.hash(entity.password);
    }

    if (entity.email) {
      entity.email = entity.email.toLowerCase();
    }
  }

  async beforeUpdate({ entity, databaseEntity }: UpdateEvent<User>): Promise<void> {
    if (entity.password) {
      const password = await BcryptHashProvider.hash(entity.password);

      if (password !== databaseEntity?.password) {
        entity.password = password;
      }
    }
  }
}
