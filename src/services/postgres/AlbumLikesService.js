const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsLikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(albumId, userId) {
    const id = `album-like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) throw new InvariantError('Like gagal ditambahkan');

    await this._cacheService.delete(`album:${albumId}:likes`);
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const { rowCount } = await this._pool.query(query);
    if (!rowCount) throw new InvariantError('Like gagal dihapus');

    await this._cacheService.delete(`album:${albumId}:likes`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}:likes`);
      return {
        likes: JSON.parse(result),
        cache: true,
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const { rowCount } = await this._pool.query(query);

      if (!rowCount) throw new InvariantError('Album tidak memiliki like');

      await this._cacheService.set(`album:${albumId}:likes`, rowCount);
      return {
        likes: rowCount,
        cache: false,
      };
    }
  }

  async verifyAlbumLike(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const { rowCount } = await this._pool.query(query);
    if (rowCount > 0) throw new InvariantError('Anda tidak bisa melakukan action ini');
  }
}

module.exports = AlbumsLikeService;
