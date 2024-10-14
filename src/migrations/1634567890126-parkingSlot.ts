import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateParkingSlot1634567890126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "parking_slot",
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
            name: "isAvailable",
            type: "boolean",
          },
          {
            name: "width",
            type: "float",
          },
          {
            name: "length",
            type: "float",
          },
          {
            name: "height",
            type: "float",
          },
          {
            name: "price",
            type: "float",
          },
          {
            name: "startAt",
            type: "int",
          },
          {
            name: "endAt",
            type: "int",
          },
          {
            name: "typeId",
            type: "int",
          },
          {
            name: "parkingLocationId",
            type: "int",
            isNullable: true,
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
      "parking_slot",
      new TableForeignKey({
        columnNames: ["typeId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_slot_type",
        name: "FK_parking_slot_type_parking_slot",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "parking_slot",
      new TableForeignKey({
        columnNames: ["parkingLocationId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_location",
        name: "FK_parking_location_parking_slot",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "parking_slot_parking_service",
        columns: [
          {
            name: "parkingSlotId",
            type: "int",
            isPrimary: true,
          },
          {
            name: "parkingServiceId",
            type: "int",
            isPrimary: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "parking_slot_parking_service",
      new TableForeignKey({
        columnNames: ["parkingSlotId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_slot",
        name: "FK_parking_slot_parking_service",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "parking_slot_parking_service",
      new TableForeignKey({
        columnNames: ["parkingServiceId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_service",
        name: "FK_parking_service_parking_slot",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "parking_slot_image",
        columns: [
          {
            name: "parkingSlotId",
            type: "int",
            isPrimary: true,
          },
          {
            name: "imageId",
            type: "int",
            isPrimary: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "parking_slot_image",
      new TableForeignKey({
        columnNames: ["parkingSlotId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_slot",
        name: "FK_image_parking_slot",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "parking_slot_image",
      new TableForeignKey({
        columnNames: ["imageId"],
        referencedColumnNames: ["id"],
        referencedTableName: "image",
        name: "FK_parking_slot_image",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("parking_slot", "FK_parking_slot_type_parking_slot");
    await queryRunner.dropForeignKey("parking_slot", "FK_parking_location_parking_slot");
    await queryRunner.dropForeignKey("parking_slot_parking_service", "FK_parking_slot_parking_service");
    await queryRunner.dropForeignKey("parking_slot_parking_service", "FK_parking_service_parking_slot");
    await queryRunner.dropForeignKey("parking_slot_image", "FK_image_parking_slot");
    await queryRunner.dropForeignKey("parking_slot_image", "FK_parking_slot_image");
    await queryRunner.dropTable("parking_slot_image");
    await queryRunner.dropTable("parking_slot_parking_service");
    await queryRunner.dropTable("parking_slot");
  }
}
