import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateParkingLocation1634567890123 implements MigrationInterface {
  name = "CreateParkingLocation1634567890123";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "parking_location",
        columns: [
          {
            name: "id",
            type: "int",
            isGenerated: true,
            isPrimary: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "address",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "lat",
            type: "decimal",
            precision: 10,
            scale: 6,
            isNullable: true,
          },
          {
            name: "lng",
            type: "decimal",
            precision: 10,
            scale: 6,
            isNullable: true,
          },
          {
            name: "access",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "partnerId",
            type: "int",
            isNullable: false,
          },
          {
            name: "paymentMethodId",
            type: "int",
            isNullable: true,
          },
          {
            name: "pricingOptionId",
            type: "int",
            isNullable: false,
          },
          {
            name: "createAt",
            type: "timestamp",
            default: "now()",
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

    await queryRunner.createForeignKey(
      "parking_location",
      new TableForeignKey({
        name: "FK_partner_parking_location",
        columnNames: ["partnerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "partner",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "parking_location",
      new TableForeignKey({
        name: "FK_payment_method_parking_location",
        columnNames: ["paymentMethodId"],
        referencedColumnNames: ["id"],
        referencedTableName: "payment_method",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "parking_location",
      new TableForeignKey({
        name: "FK_pricing_option_parking_location",
        columnNames: ["pricingOptionId"],
        referencedColumnNames: ["id"],
        referencedTableName: "pricing_option",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("parking_location", "FK_partner_parking_location");
    await queryRunner.dropForeignKey("parking_location", "FK_payment_method_parking_location");
    await queryRunner.dropForeignKey("parking_location", "FK_pricing_option_parking_location");
    await queryRunner.dropTable("parking_location");
  }
}
