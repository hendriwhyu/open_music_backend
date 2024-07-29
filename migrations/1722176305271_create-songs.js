/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'varchar(255)',
      primaryKey: true,
      unique: true,
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    year: {
      type: 'int',
      notNull: true,
    },
    genre: {
      type: 'varchar(255)',
      notNull: true,
    },
    performer: {
      type: 'varchar(255)',
      notNull: true,
    },
    duration: {
      type: 'int',
      notNull: false,
    },
    album_id: {
      type: 'varchar(255)',
      notNull: false,
      references: 'albums(id)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: false,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('songs');
};
