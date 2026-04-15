import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import GalleryTypes "../types/gallery";
import UserTypes "../types/users";
import UserLib "../lib/users";
import GalleryLib "../lib/gallery";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  mediaItems : List.List<GalleryTypes.MediaItem>,
  nextMediaId : Common.Counter,
) {
  // Public
  public query func getMediaItems(
    category : ?Text,
  ) : async [GalleryTypes.MediaItem] {
    GalleryLib.getMediaItems(mediaItems, category);
  };

  // Staff / Admin
  public shared ({ caller }) func uploadMedia(
    input : GalleryTypes.MediaInput,
  ) : async GalleryTypes.MediaItem {
    UserLib.requireAdminOrStaff(profiles, caller);
    let item = GalleryLib.uploadMedia(mediaItems, nextMediaId.value, caller, input, Time.now());
    nextMediaId.value += 1;
    item;
  };

  // Admin only
  public shared ({ caller }) func deleteMedia(
    mediaId : Common.MediaId,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    GalleryLib.deleteMedia(mediaItems, mediaId);
  };

  // Admin only
  public shared ({ caller }) func setFeatured(
    mediaId : Common.MediaId,
    featured : Bool,
  ) : async Bool {
    UserLib.requireRole(profiles, caller, #Admin);
    GalleryLib.setFeatured(mediaItems, mediaId, featured);
  };
};
