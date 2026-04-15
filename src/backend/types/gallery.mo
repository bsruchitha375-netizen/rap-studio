import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type FileType = {
    #Photo;
    #Video;
  };

  public type MediaItem = {
    id : Common.MediaId;
    title : Text;
    serviceCategory : Text;
    date : Common.Timestamp;
    fileType : FileType;
    blob : Storage.ExternalBlob;
    uploadedBy : Common.UserId;
    featured : Bool;
  };

  public type MediaInput = {
    title : Text;
    serviceCategory : Text;
    fileType : FileType;
    blob : Storage.ExternalBlob;
  };
};
