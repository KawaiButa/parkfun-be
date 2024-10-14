import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateImage1634567890124 implements MigrationInterface {
  name = "CreateImage1634567890124";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "image",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "url",
            type: "varchar",
            isNullable: false,
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
            name: "parkingLocationId",
            type: "integer",
            isNullable: true,
          },
        ],
      })
    );
    await queryRunner.createForeignKey(
      "image",
      new TableForeignKey({
        name: "FK_image_parking_location",
        columnNames: ["parkingLocationId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_location",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("image", "FK_image_parking_location");
    await queryRunner.query(`DROP TABLE "image"`);
  }
}
