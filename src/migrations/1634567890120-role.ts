import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Role1634567890121 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "role",
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
    await queryRunner.dropTable("role", true);
  }
}
