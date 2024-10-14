import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ParkingService1634567890121 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "parking_service",
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
          },
          {
            name: "description",
            type: "varchar",
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
    await queryRunner.dropTable("parking_service", true);
  }
}
