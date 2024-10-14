import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePartner1634567890122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "partner",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "location",
            type: "varchar",
          },
          {
            name: "description",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "avatarUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "typeId",
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
      "partner",
      new TableForeignKey({
        columnNames: ["typeId"],
        referencedColumnNames: ["id"],
        referencedTableName: "partner_type",
        name: "FK_partner_type_partner",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("partner", "FK_partner_type_partner");
    await queryRunner.dropTable("partner");
  }
}
