const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBPlaylistToModel, mapDBSongToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');

    return result.rows[0].id;
  }

  async addPlaylistSongActivities(data) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const { playlistId, songId, userId, action } = data;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Activity gagal ditambahkan');
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id WHERE playlists.owner = $1 OR collaborations.user_id = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBPlaylistToModel);
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id WHERE playlists.id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    return mapDBPlaylistToModel(result.rows[0]);
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');
    return result.rows.map(mapDBSongToModel);
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: 'SELECT users.username, songs.title, psa.action, psa.time FROM playlist_song_activities as psa JOIN users ON psa.user_id = users.id JOIN songs ON psa.song_id = songs.id WHERE psa.playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) throw new InvariantError('Lagu gagal dihapus dari playlist');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = result.rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async verifyPlaylistAccess(noteId, userId) {
    try {
      await this.verifyPlaylistOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;

      try {
        await this._collaborationService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
