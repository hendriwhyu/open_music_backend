const mapDBAlbumToModel = ({ id, name, year, cover = null }) => ({
  id,
  name,
  year,
  coverUrl: cover,
});

const mapDBSongToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBDetailSongToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBPlaylistToModel = ({ id, name, username }) => ({
  id,
  name,
  username,
});

module.exports = {
  mapDBAlbumToModel,
  mapDBDetailSongToModel,
  mapDBSongToModel,
  mapDBPlaylistToModel,
};
