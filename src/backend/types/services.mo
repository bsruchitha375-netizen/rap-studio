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
