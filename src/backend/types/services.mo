import Common "common";

module {
  public type SubService = {
    id : Text;
    name : Text;
  };

  public type ServiceCategory = {
    id : Text;
    name : Text;
    icon : Text;
    description : Text;
    subServices : [SubService];
  };

  // Admin-created service category stored in canister state
  public type AdminServiceCategory = {
    id : Common.ServiceId;
    name : Text;
    icon : Text;
    description : Text;
    subServices : [SubService];
    imageBlob : ?Blob;    // optional cover image blob
    createdAt : Common.Timestamp;
  };

  // Input for admin add/update service
  public type AdminServiceInput = {
    name : Text;
    icon : Text;
    description : Text;
    subServices : [SubService];
    imageData : [Nat8];   // raw bytes — empty means no image / keep existing
  };

  public type SlotStatus = {
    #Available;
    #Taken;
  };

  // Public calendar slot — ZERO client details ever
  public type BookingSlot = {
    date : Text;       // ISO date string
    timeSlot : TimeSlot;
    status : SlotStatus;
  };

  public type TimeSlot = {
    #Morning;
    #Afternoon;
    #Evening;
    #FullDay;
    #HalfDay;
    #Night;
  };

  public type LocationType = {
    #Indoor;
    #Outdoor;
    #Studio;
    #Custom : Text;  // custom place name
  };

  public type BookingStatus = {
    #Pending;
    #Confirmed;
    #PaymentPending;
    #WorkDelivered;
    #Completed;
    #Cancelled;
    #Rejected;
  };

  public type BookingRequest = {
    id : Common.BookingId;
    userId : Common.UserId;
    serviceId : Text;
    subService : Text;
    date : Text;
    timeSlot : TimeSlot;
    duration : Text;
    location : LocationType;
    status : BookingStatus;
    createdAt : Common.Timestamp;
    notes : ?Text;
    rejectedReason : ?Text;
    rescheduledDate : ?Text;
    rescheduledTime : ?Text;
  };

  public type BookingInput = {
    serviceId : Text;
    subService : Text;
    date : Text;
    timeSlot : TimeSlot;
    duration : Text;
    location : LocationType;
    notes : ?Text;
  };
};
