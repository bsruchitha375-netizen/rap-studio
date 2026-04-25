import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Common "../types/common";
import Types "../types/services";

module {
  public func getServiceCategories() : [Types.ServiceCategory] {
    [
      {
        id = "couple-shoot";
        name = "Couple Shoot";
        icon = "💑";
        description = "Romantic photography sessions for couples at every milestone.";
        subServices = [
          { id = "pre-wedding"; name = "Pre-Wedding" },
          { id = "post-wedding"; name = "Post-Wedding" },
          { id = "engagement"; name = "Engagement" },
          { id = "anniversary"; name = "Anniversary" },
          { id = "proposal-shoot"; name = "Proposal Shoot" },
          { id = "romantic-indoor"; name = "Romantic Indoor Shoot" },
          { id = "destination-couple"; name = "Destination Couple Shoot" },
          { id = "travel-love-story"; name = "Travel Love Story Shoot" },
        ];
      },
      {
        id = "single-shoot";
        name = "Single Shoot";
        icon = "👤";
        description = "Individual portrait and portfolio photography sessions.";
        subServices = [
          { id = "portfolio-shoot"; name = "Portfolio Shoot" },
          { id = "model-shoot"; name = "Model Shoot" },
          { id = "headshots"; name = "Headshots" },
          { id = "personal-branding"; name = "Personal Branding" },
          { id = "social-media-content"; name = "Social Media Content" },
          { id = "fitness-shoot"; name = "Fitness Shoot" },
          { id = "actor-portfolio"; name = "Actor Portfolio" },
        ];
      },
      {
        id = "family-shoot";
        name = "Family Shoot";
        icon = "👨‍👩‍👧";
        description = "Capturing precious family moments and milestones together.";
        subServices = [
          { id = "family-portraits"; name = "Family Portraits" },
          { id = "outdoor-session"; name = "Outdoor Session" },
          { id = "reunion-shoot"; name = "Reunion Shoot" },
          { id = "maternity-shoot"; name = "Maternity Shoot" },
          { id = "newborn-family"; name = "Newborn Family Shoot" },
          { id = "lifestyle-family"; name = "Lifestyle Family Shoot" },
        ];
      },
      {
        id = "kids-baby-shoot";
        name = "Kids & Baby Shoot";
        icon = "👶";
        description = "Adorable photography sessions for the little ones.";
        subServices = [
          { id = "newborn-shoot"; name = "Newborn Shoot" },
          { id = "baby-milestones"; name = "Baby Milestones" },
          { id = "cake-smash"; name = "Cake Smash" },
          { id = "birthday-shoot"; name = "Birthday Shoot" },
          { id = "kids-theme-shoot"; name = "Kids Theme Shoot" },
          { id = "school-photography"; name = "School Photography" },
        ];
      },
      {
        id = "wedding-shoot";
        name = "Wedding Shoot";
        icon = "👰";
        description = "Complete wedding photography coverage for your special day.";
        subServices = [
          { id = "full-wedding-coverage"; name = "Full Wedding Coverage" },
          { id = "candid-photography"; name = "Candid Photography" },
          { id = "traditional-photography"; name = "Traditional Photography" },
          { id = "reception-shoot"; name = "Reception Shoot" },
          { id = "bridal-shoot"; name = "Bridal Shoot" },
          { id = "groom-shoot"; name = "Groom Shoot" },
          { id = "drone-wedding"; name = "Drone Wedding Shoot" },
        ];
      },
      {
        id = "event-shoot";
        name = "Event Shoot";
        icon = "🎉";
        description = "Professional coverage for all kinds of events and celebrations.";
        subServices = [
          { id = "birthday-party"; name = "Birthday Party" },
          { id = "engagement-event"; name = "Engagement Event" },
          { id = "corporate-event"; name = "Corporate Event" },
          { id = "cultural-event"; name = "Cultural Event" },
          { id = "college-fest"; name = "College Fest" },
          { id = "private-party"; name = "Private Party" },
        ];
      },
      {
        id = "corporate-shoot";
        name = "Corporate Shoot";
        icon = "🏢";
        description = "Professional photography for businesses and organizations.";
        subServices = [
          { id = "business-headshots"; name = "Business Headshots" },
          { id = "office-branding"; name = "Office Branding" },
          { id = "team-photos"; name = "Team Photos" },
          { id = "product-photography-corp"; name = "Product Photography" },
          { id = "conference-coverage"; name = "Conference Coverage" },
          { id = "industrial-shoot"; name = "Industrial Shoot" },
        ];
      },
      {
        id = "fashion-shoot";
        name = "Fashion Shoot";
        icon = "👗";
        description = "High-end fashion and editorial photography.";
        subServices = [
          { id = "fashion-portfolio"; name = "Fashion Portfolio" },
          { id = "editorial-shoot"; name = "Editorial Shoot" },
          { id = "lookbook-shoot"; name = "Lookbook Shoot" },
          { id = "brand-shoot"; name = "Brand Shoot" },
          { id = "glamour-shoot"; name = "Glamour Shoot" },
        ];
      },
      {
        id = "product-commercial-shoot";
        name = "Product & Commercial Shoot";
        icon = "🍽";
        description = "Premium product and commercial photography for brands.";
        subServices = [
          { id = "ecommerce-product"; name = "E-commerce Product" },
          { id = "food-photography"; name = "Food Photography" },
          { id = "jewelry-shoot"; name = "Jewelry Shoot" },
          { id = "catalog-shoot"; name = "Catalog Shoot" },
          { id = "advertisement-shoot"; name = "Advertisement Shoot" },
          { id = "360-product"; name = "360° Product Shoot" },
        ];
      },
      {
        id = "real-estate-shoot";
        name = "Real Estate Shoot";
        icon = "🏠";
        description = "Architectural and property photography for real estate professionals.";
        subServices = [
          { id = "property-shoot"; name = "Property Shoot" },
          { id = "interior-photography"; name = "Interior Photography" },
          { id = "exterior-photography"; name = "Exterior Photography" },
          { id = "commercial-spaces"; name = "Commercial Spaces" },
          { id = "airbnb-listings"; name = "Airbnb Listings" },
          { id = "drone-property"; name = "Drone Property Shoot" },
        ];
      },
      {
        id = "travel-destination-shoot";
        name = "Travel & Destination Shoot";
        icon = "✈️";
        description = "Stunning travel and destination photography worldwide.";
        subServices = [
          { id = "travel-photography"; name = "Travel Photography" },
          { id = "destination-shoot"; name = "Destination Shoot" },
          { id = "landscape-shoot"; name = "Landscape Shoot" },
          { id = "street-photography"; name = "Street Photography" },
          { id = "tourism-promotion"; name = "Tourism Promotion" },
        ];
      },
      {
        id = "videography-services";
        name = "Videography Services";
        icon = "🎥";
        description = "Professional video production and cinematic storytelling.";
        subServices = [
          { id = "wedding-cinematic-video"; name = "Wedding Cinematic Video" },
          { id = "event-highlights"; name = "Event Highlights" },
          { id = "promotional-videos"; name = "Promotional Videos" },
          { id = "music-videos"; name = "Music Videos" },
          { id = "youtube-content"; name = "YouTube Content" },
          { id = "drone-videography"; name = "Drone Videography" },
        ];
      },
      {
        id = "creative-artistic-shoot";
        name = "Creative & Artistic Shoot";
        icon = "🧑‍🎨";
        description = "Fine art and conceptual photography for creative expression.";
        subServices = [
          { id = "conceptual-photography"; name = "Conceptual Photography" },
          { id = "fine-art-shoot"; name = "Fine Art Shoot" },
          { id = "bw-shoot"; name = "Black & White Shoot" },
          { id = "themed-shoot"; name = "Themed Shoot" },
          { id = "cinematic-portraits"; name = "Cinematic Portraits" },
        ];
      },
      {
        id = "fitness-lifestyle-shoot";
        name = "Fitness & Lifestyle Shoot";
        icon = "🏋️";
        description = "Dynamic fitness and lifestyle photography sessions.";
        subServices = [
          { id = "gym-shoot"; name = "Gym Shoot" },
          { id = "transformation-shoot"; name = "Transformation Shoot" },
          { id = "fitness-branding"; name = "Fitness Branding" },
          { id = "athlete-shoot"; name = "Athlete Shoot" },
          { id = "yoga-shoot"; name = "Yoga Shoot" },
        ];
      },
      {
        id = "pet-photography";
        name = "Pet Photography";
        icon = "🐾";
        description = "Adorable pet portraits and pet-owner photography sessions.";
        subServices = [
          { id = "pet-portraits"; name = "Pet Portraits" },
          { id = "pet-owner-shoot"; name = "Pet & Owner Shoot" },
          { id = "outdoor-pet-session"; name = "Outdoor Pet Session" },
          { id = "pet-events"; name = "Pet Events" },
          { id = "creative-pet-themes"; name = "Creative Pet Themes" },
        ];
      },
      {
        id = "automobile-shoot";
        name = "Automobile Shoot";
        icon = "🚗";
        description = "High-impact automotive photography for cars, bikes, and showrooms.";
        subServices = [
          { id = "car-photography"; name = "Car Photography" },
          { id = "bike-photography"; name = "Bike Photography" },
          { id = "showroom-shoot"; name = "Showroom Shoot" },
          { id = "automotive-ads"; name = "Automotive Ads" },
          { id = "drone-car-shoot"; name = "Drone Car Shoot" },
        ];
      },
      {
        id = "ecommerce-brand-shoot";
        name = "E-commerce Brand Shoot";
        icon = "🛍";
        description = "Marketplace-ready product photography for online sellers.";
        subServices = [
          { id = "product-listing-photos"; name = "Product Listing Photos" },
          { id = "lifestyle-product-shoot"; name = "Lifestyle Product Shoot" },
          { id = "social-media-ads"; name = "Social Media Ads" },
          { id = "brand-campaign-content"; name = "Brand Campaign Content" },
          { id = "marketplace-ready-images"; name = "Marketplace Ready Images" },
        ];
      },
      {
        id = "food-restaurant-shoot";
        name = "Food & Restaurant Shoot";
        icon = "🧑‍🍳";
        description = "Mouth-watering food photography for restaurants and delivery platforms.";
        subServices = [
          { id = "menu-photography"; name = "Menu Photography" },
          { id = "restaurant-interiors"; name = "Restaurant Interiors" },
          { id = "chef-portraits"; name = "Chef Portraits" },
          { id = "food-styling-shoot"; name = "Food Styling Shoot" },
          { id = "zomato-swiggy-listings"; name = "Zomato/Swiggy Listings" },
        ];
      },
      {
        id = "educational-shoot";
        name = "Educational Shoot";
        icon = "🏫";
        description = "Professional photography for educational institutions.";
        subServices = [
          { id = "school-photos"; name = "School Photos" },
          { id = "college-events"; name = "College Events" },
          { id = "graduation-shoot"; name = "Graduation Shoot" },
          { id = "campus-branding"; name = "Campus Branding" },
          { id = "student-portfolio"; name = "Student Portfolio" },
        ];
      },
      {
        id = "medical-healthcare-shoot";
        name = "Medical & Healthcare Shoot";
        icon = "🏥";
        description = "Professional photography for healthcare institutions and professionals.";
        subServices = [
          { id = "hospital-branding"; name = "Hospital Branding" },
          { id = "doctor-profiles"; name = "Doctor Profiles" },
          { id = "clinic-interior"; name = "Clinic Interior Shoot" },
          { id = "medical-equipment"; name = "Medical Equipment Shoot" },
        ];
      },
      {
        id = "entertainment-industry-shoot";
        name = "Entertainment Industry Shoot";
        icon = "🎭";
        description = "Portfolio and promotional photography for the entertainment industry.";
        subServices = [
          { id = "actor-portfolio-ent"; name = "Actor Portfolio" },
          { id = "audition-shoot"; name = "Audition Shoot" },
          { id = "film-promotions"; name = "Film Promotions" },
          { id = "behind-the-scenes"; name = "Behind-the-scenes" },
          { id = "casting-portfolio"; name = "Casting Portfolio" },
        ];
      },
      {
        id = "social-media-content-creation";
        name = "Social Media Content Creation";
        icon = "📱";
        description = "Viral-worthy content creation for social media platforms.";
        subServices = [
          { id = "instagram-reels"; name = "Instagram Reels" },
          { id = "influencer-content"; name = "Influencer Content" },
          { id = "youtube-shorts"; name = "YouTube Shorts" },
          { id = "branding-content"; name = "Branding Content" },
          { id = "viral-campaign-shoot"; name = "Viral Campaign Shoot" },
        ];
      },
      {
        id = "special-occasion-shoot";
        name = "Special Occasion Shoot";
        icon = "🎁";
        description = "Photography for all your special life celebrations and occasions.";
        subServices = [
          { id = "baby-shower"; name = "Baby Shower" },
          { id = "housewarming"; name = "Housewarming" },
          { id = "retirement-function"; name = "Retirement Function" },
          { id = "festive-shoots"; name = "Festive Shoots (Diwali/Christmas)" },
          { id = "surprise-events"; name = "Surprise Events" },
        ];
      },
    ];
  };

  public func getPublicCalendar(
    bookings : List.List<Types.BookingRequest>,
  ) : [Types.BookingSlot] {
    let result = List.empty<Types.BookingSlot>();
    for (booking in bookings.values()) {
      switch (booking.status) {
        case (#Cancelled) {};
        case _ {
          result.add({
            date = booking.date;
            timeSlot = booking.timeSlot;
            status = #Taken;
          });
        };
      };
    };
    result.toArray();
  };

  public func createBookingRequest(
    bookings : List.List<Types.BookingRequest>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.BookingInput,
  ) : Types.BookingRequest {
    // Check for time conflict
    for (existing in bookings.values()) {
      if (existing.date == input.date and
          timeSlotsConflict(existing.timeSlot, input.timeSlot) and
          existing.status != #Cancelled and
          existing.status != #Rejected) {
        Runtime.trap("Time slot already booked");
      };
    };
    let booking : Types.BookingRequest = {
      id = nextId;
      userId = caller;
      serviceId = input.serviceId;
      subService = input.subService;
      date = input.date;
      timeSlot = input.timeSlot;
      duration = input.duration;
      location = input.location;
      status = #Pending;
      createdAt = Time.now();
      notes = input.notes;
      rejectedReason = null;
      rescheduledDate = null;
      rescheduledTime = null;
    };
    bookings.add(booking);
    booking;
  };

  func timeSlotsConflict(a : Types.TimeSlot, b : Types.TimeSlot) : Bool {
    switch (a, b) {
      case (#FullDay, _) { true };
      case (_, #FullDay) { true };
      case (#HalfDay, #Morning) { true };
      case (#HalfDay, #Afternoon) { true };
      case (#HalfDay, #HalfDay) { true };
      case (#Morning, #HalfDay) { true };
      case (#Afternoon, #HalfDay) { true };
      case _ { a == b };
    };
  };

  public func getMyBookings(
    bookings : List.List<Types.BookingRequest>,
    caller : Common.UserId,
  ) : [Types.BookingRequest] {
    bookings.filter(func(b) { b.userId == caller }).toArray();
  };

  public func getAllBookings(
    bookings : List.List<Types.BookingRequest>,
  ) : [Types.BookingRequest] {
    bookings.toArray();
  };

  public func confirmBooking(
    bookings : List.List<Types.BookingRequest>,
    bookingId : Common.BookingId,
    _caller : Common.UserId,
  ) : Bool {
    var found = false;
    bookings.mapInPlace(func(b) {
      if (b.id == bookingId and b.status == #Pending) {
        found := true;
        { b with status = #Confirmed };
      } else { b };
    });
    found;
  };

  public func rejectBooking(
    bookings : List.List<Types.BookingRequest>,
    bookingId : Common.BookingId,
    reason : Text,
  ) : Bool {
    var found = false;
    bookings.mapInPlace(func(b) {
      if (b.id == bookingId) {
        found := true;
        { b with status = #Rejected; rejectedReason = ?reason };
      } else { b };
    });
    found;
  };

  public func rescheduleBooking(
    bookings : List.List<Types.BookingRequest>,
    bookingId : Common.BookingId,
    newDate : Text,
    newTime : Text,
  ) : Bool {
    var found = false;
    bookings.mapInPlace(func(b) {
      if (b.id == bookingId) {
        found := true;
        { b with rescheduledDate = ?newDate; rescheduledTime = ?newTime; status = #Confirmed };
      } else { b };
    });
    found;
  };

  public func getBookingsByDate(
    bookings : List.List<Types.BookingRequest>,
    date : Text,
  ) : [Types.BookingRequest] {
    bookings.filter(func(b) { b.date == date }).toArray();
  };

  public func updateBookingStatus(
    bookings : List.List<Types.BookingRequest>,
    bookingId : Common.BookingId,
    status : Types.BookingStatus,
  ) : Bool {
    var found = false;
    bookings.mapInPlace(func(b) {
      if (b.id == bookingId) {
        found := true;
        { b with status = status };
      } else { b };
    });
    found;
  };

  public func getBookingById(
    bookings : List.List<Types.BookingRequest>,
    bookingId : Common.BookingId,
  ) : ?Types.BookingRequest {
    bookings.find(func(b) { b.id == bookingId });
  };

  // ── Admin service CRUD ────────────────────────────────────────────────────

  // Merge static service categories with admin-added ones.
  // Admin services are projected to ServiceCategory (imageBlob not included in public type).
  public func getMergedServiceCategories(
    adminServices : List.List<Types.AdminServiceCategory>,
  ) : [Types.ServiceCategory] {
    let staticCategories = getServiceCategories();
    let adminConverted = List.empty<Types.ServiceCategory>();
    for (svc in adminServices.values()) {
      adminConverted.add({
        id = svc.id.toText();
        name = svc.name;
        icon = svc.icon;
        description = svc.description;
        subServices = svc.subServices;
      });
    };
    staticCategories.concat(adminConverted.toArray());
  };

  public func adminAddService(
    adminServices : List.List<Types.AdminServiceCategory>,
    nextId : Nat,
    input : Types.AdminServiceInput,
  ) : Types.AdminServiceCategory {
    let imageBlob : ?Blob = if (input.imageData.size() == 0) {
      null;
    } else {
      ?Blob.fromArray(input.imageData);
    };
    let svc : Types.AdminServiceCategory = {
      id = nextId;
      name = input.name;
      icon = input.icon;
      description = input.description;
      subServices = input.subServices;
      imageBlob = imageBlob;
      createdAt = Time.now();
    };
    adminServices.add(svc);
    svc;
  };

  public func adminUpdateService(
    adminServices : List.List<Types.AdminServiceCategory>,
    serviceId : Common.ServiceId,
    input : Types.AdminServiceInput,
  ) : Bool {
    var found = false;
    adminServices.mapInPlace(func(svc) {
      if (svc.id == serviceId) {
        found := true;
        let newBlob : ?Blob = if (input.imageData.size() == 0) {
          svc.imageBlob;
        } else {
          ?Blob.fromArray(input.imageData);
        };
        {
          svc with
          name = input.name;
          icon = input.icon;
          description = input.description;
          subServices = input.subServices;
          imageBlob = newBlob;
        };
      } else { svc };
    });
    found;
  };

  public func adminDeleteService(
    adminServices : List.List<Types.AdminServiceCategory>,
    serviceId : Common.ServiceId,
  ) : Bool {
    let before = adminServices.size();
    let filtered = adminServices.filter(func(svc) { svc.id != serviceId });
    adminServices.clear();
    adminServices.append(filtered);
    adminServices.size() < before;
  };

  public func getAllAdminServices(
    adminServices : List.List<Types.AdminServiceCategory>,
  ) : [Types.AdminServiceCategory] {
    adminServices.toArray();
  };

  public func getAdminServiceById(
    adminServices : List.List<Types.AdminServiceCategory>,
    serviceId : Common.ServiceId,
  ) : ?Types.AdminServiceCategory {
    adminServices.find(func(svc) { svc.id == serviceId });
  };
};
