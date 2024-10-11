import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUserTable1634567890125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "roleId",
            type: "int",
            isNullable: false,
          },
          {
            name: "partnerId",
            type: "int",
            isNullable: true,
          },
          {
            name: "imageId",
            type: "int",
            isNullable: true,
          },
          {
            name: "password",
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
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "phoneNumber",
            type: "varchar",
            isNullable: true,
            isUnique: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "user",
      new TableForeignKey({
        name: "FK_role_user",
        columnNames: ["roleId"],
        referencedColumnNames: ["id"],
        referencedTableName: "role",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "user",
      new TableForeignKey({
        columnNames: ["partnerId"],
        name: "FK_partner_user",
        referencedColumnNames: ["id"],
        referencedTableName: "partner",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "user",
      new TableForeignKey({
        name: "FK_image_user",
        columnNames: ["imageId"],
        referencedColumnNames: ["id"],
        referencedTableName: "image",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("user", "FK_role_user");
    await queryRunner.dropForeignKey("user", "FK_partner_user");
    await queryRunner.dropForeignKey("user", "FK_image_user");
    await queryRunner.dropTable("user");
  }
}
