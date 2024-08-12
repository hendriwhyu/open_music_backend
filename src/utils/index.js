const mapDBAlbumToModel = ({ id, name, year, songs }) => ({
  id,
  name,
  year,
  songs,
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
