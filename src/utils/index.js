const mapDBAlbumToModel = ({ id, name, year, songs }) => ({
  id,
  name,
  year,
  songs,
});

const mapDBSongToModel = ({
  id,
  title,
  performer,
}) => ({
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

module.exports = { mapDBAlbumToModel, mapDBDetailSongToModel, mapDBSongToModel };
