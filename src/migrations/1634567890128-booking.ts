import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
export enum BookingStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  HOLDING = "holding",
  EXPIRED = "expired",
  REFUNDED = "refunded",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  BOOKING = "booking",
  REQUEST_COMPLETE = "request_complete",
}
export class CreateBooking1634567890128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "booking",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "userId",
            type: "int",
          },
          {
            name: "parkingSlotId",
            type: "int",
          },
          {
            name: "status",
            type: "enum",
            enum: [
              "pending",
              "completed",
              "cancelled",
              "holding",
              "expired",
              "refunded",
              "accepted",
              "rejected",
              "booking",
              "request_complete",
            ],
            default: "'pending'",
          },
          {
            name: "amount",
            type: "decimal",
          },
          {
            name: "startAt",
            type: "timestamp",
          },
          {
            name: "fee",
            type: "decimal",
          },
          {
            name: "endAt",
            type: "timestamp",
          },
          {
            name: "paymentRecordId",
            isNullable: true,
            type: "int",
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

    await queryRunner.createForeignKey(
      "booking",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
        name: "FK_booking_user",
      })
    );

    await queryRunner.createForeignKey(
      "booking",
      new TableForeignKey({
        columnNames: ["paymentRecordId"],
        referencedColumnNames: ["id"],
        referencedTableName: "payment_record",
        name: "FK_booking_payment_record",
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createForeignKey(
      "booking",
      new TableForeignKey({
        columnNames: ["parkingSlotId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_slot",
        name: "FK_booking_parking_slot",
      })
    );
    await queryRunner.createTable(
      new Table({
        name: "booking_parking_service",
        columns: [
          {
            name: "bookingId",
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
      "booking_parking_service",
      new TableForeignKey({
        columnNames: ["bookingId"],
        referencedColumnNames: ["id"],
        referencedTableName: "booking",
        name: "FK_booking_parking_service",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "booking_parking_service",
      new TableForeignKey({
        columnNames: ["parkingServiceId"],
        referencedColumnNames: ["id"],
        referencedTableName: "parking_service",
        name: "FK_parking_service_booking",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("booking", "FK_booking_user");
    await queryRunner.dropForeignKey("booking", "FK_booking_parking_slot");
    await queryRunner.dropForeignKey("booking_parking_service", "FK_booking_parking_service");
    await queryRunner.dropForeignKey("booking_parking_service", "FK_parking_service_booking");
    await queryRunner.dropTable("booking_parking_service");
    await queryRunner.dropTable("booking");
  }
}
