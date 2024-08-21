const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);
    await this._service.verifyAlbumLike(albumId, userId);
    await this._service.addAlbumLike(albumId, userId);
    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });
    response.code(201);

    return response;
  }

  async deleteAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);
    return h.response({
      status: 'success',
      message: 'Like berhasil dihapus',
    });
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, cache } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cache) response.header('X-Data-Source', 'cache');
    return response;
  }
}

module.exports = AlbumLikesHandler;
