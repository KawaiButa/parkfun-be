import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class PartnerType1634567890121 implements MigrationInterface {
  name = "PartnerType1634567890121";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "partner_type",
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
    await queryRunner.query(`DROP TABLE "partner_type";`);
  }
}
