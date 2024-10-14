import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentMethod1634567890121 implements MigrationInterface {
  name = "CreatePaymentMethod1634567890121";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payment_method",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "description",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "createAt",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "deleteAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("payment_method", true);
  }
}
