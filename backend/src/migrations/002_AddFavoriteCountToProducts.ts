import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavoriteCountToProducts1647234567890 implements MigrationInterface {
    name = 'AddFavoriteCountToProducts1647234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE products 
            ADD COLUMN favorite_count INTEGER DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE products 
            DROP COLUMN favorite_count
        `);
    }
}
