import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import CourseTypes "../types/courses";

module {
  public func getAllCourses() : [CourseTypes.Course] {
    [
      // Photography (15)
      { id = 1; title = "Photography Fundamentals"; category = "Photography"; mode = #Hybrid; price = 5; description = "Master the basics of photography from camera settings to composition."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 2; title = "Lighting Mastery"; category = "Photography"; mode = #Offline; price = 5; description = "Learn professional lighting techniques for stunning photos."; duration = "3 weeks"; prerequisites = ["Photography Fundamentals"]; imageUrl = ""; status = #Active },
      { id = 3; title = "Portrait Photography"; category = "Photography"; mode = #Hybrid; price = 5; description = "Create compelling portraits with expert posing and lighting."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 4; title = "Wedding Photography"; category = "Photography"; mode = #Offline; price = 5; description = "Capture magical wedding moments professionally."; duration = "5 weeks"; prerequisites = ["Photography Fundamentals"]; imageUrl = ""; status = #Active },
      { id = 5; title = "Fashion Photography"; category = "Photography"; mode = #Offline; price = 5; description = "High-fashion editorial and commercial photography."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 6; title = "Street Photography"; category = "Photography"; mode = #Online; price = 5; description = "Capture authentic street life and urban stories."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 7; title = "Landscape Photography"; category = "Photography"; mode = #Online; price = 5; description = "Stunning nature and landscape photography techniques."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 8; title = "Product Photography"; category = "Photography"; mode = #Hybrid; price = 5; description = "Professional product photography for e-commerce and advertising."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 9; title = "Food Photography"; category = "Photography"; mode = #Offline; price = 5; description = "Mouth-watering food styling and photography."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 10; title = "Architectural Photography"; category = "Photography"; mode = #Online; price = 5; description = "Interior and exterior architectural photography mastery."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 11; title = "Night & Long Exposure"; category = "Photography"; mode = #Offline; price = 5; description = "Stunning night photography and long exposure techniques."; duration = "2 weeks"; prerequisites = ["Photography Fundamentals"]; imageUrl = ""; status = #Active },
      { id = 12; title = "Black & White Photography"; category = "Photography"; mode = #Online; price = 5; description = "The art and craft of black and white photography."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 13; title = "Mobile Photography"; category = "Photography"; mode = #Online; price = 5; description = "Professional-quality photos using your smartphone."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 14; title = "Photo Composition & Framing"; category = "Photography"; mode = #Online; price = 5; description = "Master composition rules for visually compelling images."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 15; title = "Camera Settings Mastery"; category = "Photography"; mode = #Online; price = 5; description = "Deep dive into aperture, shutter speed, ISO, and more."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      // Videography & Film (10)
      { id = 16; title = "Videography Basics"; category = "Videography & Film"; mode = #Hybrid; price = 5; description = "Introduction to professional videography fundamentals."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 17; title = "DSLR Video Production"; category = "Videography & Film"; mode = #Offline; price = 5; description = "Professional video production with DSLR cameras."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 18; title = "Short Film Direction"; category = "Videography & Film"; mode = #Offline; price = 5; description = "Directing and producing compelling short films."; duration = "6 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 19; title = "Cinematic Storytelling"; category = "Videography & Film"; mode = #Hybrid; price = 5; description = "Visual storytelling techniques used in cinematic productions."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 20; title = "Documentary Filmmaking"; category = "Videography & Film"; mode = #Offline; price = 5; description = "Research, shoot, and edit powerful documentary films."; duration = "6 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 21; title = "Drone Photography & Videography"; category = "Videography & Film"; mode = #Offline; price = 5; description = "Aerial photography and videography with drones."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 22; title = "Event Videography"; category = "Videography & Film"; mode = #Hybrid; price = 5; description = "Professional video coverage of events and celebrations."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 23; title = "Wedding Cinematography"; category = "Videography & Film"; mode = #Offline; price = 5; description = "Cinematic wedding video production techniques."; duration = "5 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 24; title = "YouTube Content Creation"; category = "Videography & Film"; mode = #Online; price = 5; description = "Create engaging YouTube content from scratch to channel growth."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 25; title = "Instagram Reels & Shorts"; category = "Videography & Film"; mode = #Online; price = 5; description = "Create viral short-form video content for social media."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      // Editing & Post-Production (10)
      { id = 26; title = "Lightroom Mastery"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Professional photo editing and workflow in Adobe Lightroom."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 27; title = "Photoshop for Photographers"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Advanced photo editing and retouching in Photoshop."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 28; title = "Adobe Premiere Pro"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Professional video editing workflow in Adobe Premiere Pro."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 29; title = "Final Cut Pro"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Master video editing in Final Cut Pro for Mac."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 30; title = "DaVinci Resolve Color Grading"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Professional color grading with DaVinci Resolve."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 31; title = "After Effects Basics"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Motion graphics and visual effects fundamentals."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 32; title = "Video Color Grading"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Color grading techniques for cinematic video production."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 33; title = "Photo Retouching"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Professional portrait and product photo retouching."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 34; title = "Batch Editing Workflows"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Streamline your editing with efficient batch processing workflows."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 35; title = "AI Tools for Editing"; category = "Editing & Post-Production"; mode = #Online; price = 5; description = "Leverage AI-powered tools to enhance your editing workflow."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      // Business & Studio (10)
      { id = 36; title = "Studio Management"; category = "Business & Studio"; mode = #Hybrid; price = 5; description = "Run a successful photography and videography studio."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 37; title = "Client Communication & Sales"; category = "Business & Studio"; mode = #Online; price = 5; description = "Client relationship management and sales for photographers."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 38; title = "Building a Photography Business"; category = "Business & Studio"; mode = #Online; price = 5; description = "Launch and grow a sustainable photography business."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 39; title = "Social Media Marketing for Studios"; category = "Business & Studio"; mode = #Online; price = 5; description = "Market your studio effectively on social media platforms."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 40; title = "Pricing & Packages Strategy"; category = "Business & Studio"; mode = #Online; price = 5; description = "Create competitive pricing strategies for photography services."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 41; title = "Brand Building for Photographers"; category = "Business & Studio"; mode = #Online; price = 5; description = "Build a strong personal brand as a photographer."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 42; title = "Creating a Portfolio Website"; category = "Business & Studio"; mode = #Online; price = 5; description = "Design and launch a professional photography portfolio website."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 43; title = "E-commerce Photography Business"; category = "Business & Studio"; mode = #Online; price = 5; description = "Build a profitable e-commerce product photography business."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 44; title = "Instagram Growth for Photographers"; category = "Business & Studio"; mode = #Online; price = 5; description = "Grow your Instagram presence and attract photography clients."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 45; title = "Legal & Contracts for Creatives"; category = "Business & Studio"; mode = #Online; price = 5; description = "Essential legal knowledge and contract templates for photographers."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      // Specialized (10)
      { id = 46; title = "Newborn & Baby Photography"; category = "Specialized"; mode = #Offline; price = 5; description = "Safe and stunning newborn and baby photography techniques."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 47; title = "Pet Photography"; category = "Specialized"; mode = #Offline; price = 5; description = "Capture the personality of pets in stunning portraits."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 48; title = "Fitness & Lifestyle Shooting"; category = "Specialized"; mode = #Offline; price = 5; description = "Dynamic fitness and lifestyle photography techniques."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 49; title = "Real Estate Photography"; category = "Specialized"; mode = #Hybrid; price = 5; description = "Professional interior and exterior real estate photography."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 50; title = "Automobile Photography"; category = "Specialized"; mode = #Offline; price = 5; description = "High-impact automotive photography techniques."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 51; title = "Maternity Photography"; category = "Specialized"; mode = #Offline; price = 5; description = "Beautiful and sensitive maternity photography sessions."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 52; title = "Boudoir & Glamour Photography"; category = "Specialized"; mode = #Offline; price = 5; description = "Empowering and tasteful boudoir photography."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 53; title = "Stage & Event Lighting"; category = "Specialized"; mode = #Offline; price = 5; description = "Professional lighting setups for stages and events."; duration = "3 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 54; title = "Green Screen & Studio Setup"; category = "Specialized"; mode = #Offline; price = 5; description = "Complete studio and green screen setup and workflow."; duration = "2 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
      { id = 55; title = "Aerial & Drone Certification"; category = "Specialized"; mode = #Offline; price = 5; description = "Drone certification and aerial photography professional training."; duration = "4 weeks"; prerequisites = []; imageUrl = ""; status = #Active },
    ];
  };

  public func getCourseById(
    courseId : Common.CourseId,
  ) : ?CourseTypes.Course {
    let courses = getAllCourses();
    courses.find(func(c) { c.id == courseId });
  };

  public func enrollCourse(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    nextId : Nat,
    caller : Common.UserId,
    courseId : Common.CourseId,
  ) : CourseTypes.CourseEnrollment {
    // Validate course exists
    switch (getCourseById(courseId)) {
      case null { Runtime.trap("Course not found") };
      case (?_) {};
    };
    // Check not already enrolled
    switch (enrollments.find(func(e) { e.userId == caller and e.courseId == courseId })) {
      case (?_) { Runtime.trap("Already enrolled in this course") };
      case null {};
    };
    let enrollment : CourseTypes.CourseEnrollment = {
      id = nextId;
      userId = caller;
      courseId = courseId;
      enrolledAt = Time.now();
      paymentStatus = #Pending;
      completedAt = null;
      certificateCode = null;
      progress = 0;
    };
    enrollments.add(enrollment);
    enrollment;
  };

  public func getMyEnrollments(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    caller : Common.UserId,
  ) : [CourseTypes.CourseEnrollment] {
    enrollments.filter(func(e) { e.userId == caller }).toArray();
  };

  public func getAllEnrollments(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
  ) : [CourseTypes.CourseEnrollment] {
    enrollments.toArray();
  };

  public func updateCourseProgress(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    caller : Common.UserId,
    courseId : Common.CourseId,
    completed : Bool,
  ) : Bool {
    var found = false;
    enrollments.mapInPlace(func(e) {
      if (e.userId == caller and e.courseId == courseId) {
        found := true;
        let newProgress : Nat = if (completed) { 100 } else { e.progress };
        let completedAt : ?Common.Timestamp = if (completed) { ?Time.now() } else { e.completedAt };
        { e with progress = newProgress; completedAt = completedAt };
      } else { e };
    });
    found;
  };

  public func getEnrollmentById(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    enrollmentId : Common.EnrollmentId,
  ) : ?CourseTypes.CourseEnrollment {
    enrollments.find(func(e) { e.id == enrollmentId });
  };

  public func markCertificateIssued(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    enrollmentId : Common.EnrollmentId,
    code : Text,
  ) : Bool {
    var found = false;
    enrollments.mapInPlace(func(e) {
      if (e.id == enrollmentId) {
        found := true;
        { e with certificateCode = ?code };
      } else { e };
    });
    found;
  };
};
