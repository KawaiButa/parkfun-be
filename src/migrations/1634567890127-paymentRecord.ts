import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentRecord1634567890127 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "payment_record",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "amount",
            type: "decimal",
          },
          {
            name: "transactionId",
            type: "varchar",
          },
          {
            name: "isRefunded",
            type: "boolean",
            default: false,
          },
          {
            name: "receiptUrl",
            type: "varchar",
          },
          {
            name: "createAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "deleteAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("payment_record", "FK_booking_payment");
    await queryRunner.dropTable("p");
  }
}
