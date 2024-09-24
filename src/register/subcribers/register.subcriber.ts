import { Injectable } from "@nestjs/common";
import { Account } from "src/account/entities/account.entity";
import { BcryptHashProvider } from "src/hash/providers/hash.provider";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";

@EventSubscriber()
@Injectable()
export class RegisterSubcriber implements EntitySubscriberInterface<Account> {
  listenTo() {
    return Account;
  }
  async beforeInsert({ entity }: InsertEvent<Account>): Promise<void> {
    if (entity.password) {
      entity.password = await BcryptHashProvider.hash(entity.password);
    }

    if (entity.email) {
      entity.email = entity.email.toLowerCase();
    }
  }

  async beforeUpdate({ entity, databaseEntity }: UpdateEvent<Account>): Promise<void> {
    if (entity.password) {
      const password = await BcryptHashProvider.hash(entity.password);

      if (password !== databaseEntity?.password) {
        entity.password = password;
      }
    }
  }
}
