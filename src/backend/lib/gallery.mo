import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import GalleryTypes "../types/gallery";

module {
  public func getMediaItems(
    items : List.List<GalleryTypes.MediaItem>,
    category : ?Text,
  ) : [GalleryTypes.MediaItem] {
    switch (category) {
      case null { items.toArray() };
      case (?cat) {
        items.filter(func(m) { m.serviceCategory == cat }).toArray();
      };
    };
  };

  public func uploadMedia(
    items : List.List<GalleryTypes.MediaItem>,
    nextId : Nat,
    caller : Common.UserId,
    input : GalleryTypes.MediaInput,
    uploadedAt : Common.Timestamp,
  ) : GalleryTypes.MediaItem {
    let item : GalleryTypes.MediaItem = {
      id = nextId;
      title = input.title;
      serviceCategory = input.serviceCategory;
      date = uploadedAt;
      fileType = input.fileType;
      blob = input.blob;
      uploadedBy = caller;
      featured = false;
    };
    items.add(item);
    item;
  };

  public func deleteMedia(
    items : List.List<GalleryTypes.MediaItem>,
    mediaId : Common.MediaId,
  ) : Bool {
    let before = items.size();
    let filtered = items.filter(func(m) { m.id != mediaId });
    items.clear();
    items.append(filtered);
    items.size() < before;
  };

  public func setFeatured(
    items : List.List<GalleryTypes.MediaItem>,
    mediaId : Common.MediaId,
    featured : Bool,
  ) : Bool {
    var found = false;
    items.mapInPlace(func(m) {
      if (m.id == mediaId) {
        found := true;
        { m with featured = featured };
      } else { m };
    });
    found;
  };
};
