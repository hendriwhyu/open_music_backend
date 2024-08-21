const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBAlbumToModel, mapDBSongToModel } = require('../../utils/index');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const querry = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const { rows } = await this._pool.query(querry);

    if (!rows[0].id) throw new InvariantError('Album gagal ditambahkan');

    return rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBAlbumToModel);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) throw new NotFoundError('Album tidak ditemukan');
    return mapDBAlbumToModel(rows[0]);
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const { rows } = await this._pool.query(query);
    return rows.map(mapDBSongToModel);
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
  }

  async addAlbumCoverById(id, path) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [path, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) throw new NotFoundError('Gagal memperbarui cover album. Id tidak ditemukan');
  }
}

module.exports = AlbumsService;
