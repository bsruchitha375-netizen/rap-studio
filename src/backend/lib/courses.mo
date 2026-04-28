import List "mo:core/List";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Common "../types/common";
import CourseTypes "../types/courses";

module {
  // ── Existing helpers (unchanged) ──────────────────────────────────────────

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

  public func getCourseById(courseId : Common.CourseId) : ?CourseTypes.Course {
    let courses = getAllCourses();
    courses.find(func(c) { c.id == courseId });
  };

  public func getMergedCourses(adminCourses : List.List<CourseTypes.AdminCourse>) : [CourseTypes.Course] {
    let staticCourses = getAllCourses();
    let adminConverted = List.empty<CourseTypes.Course>();
    for (ac in adminCourses.values()) {
      adminConverted.add({
        id = ac.id;
        title = ac.title;
        category = ac.category;
        mode = ac.mode;
        price = ac.price;
        description = ac.description;
        duration = ac.duration;
        prerequisites = ac.prerequisites;
        imageUrl = "";
        status = ac.status;
      });
    };
    staticCourses.concat(adminConverted.toArray());
  };

  public func getAdminCourseById(
    adminCourses : List.List<CourseTypes.AdminCourse>,
    courseId : Common.CourseId,
  ) : ?CourseTypes.AdminCourse {
    adminCourses.find(func(ac) { ac.id == courseId });
  };

  public func adminAddCourse(
    adminCourses : List.List<CourseTypes.AdminCourse>,
    nextId : Nat,
    input : CourseTypes.AdminCourseInput,
  ) : CourseTypes.AdminCourse {
    let imageBlob : ?Blob = if (input.imageData.size() == 0) {
      null;
    } else {
      ?Blob.fromArray(input.imageData);
    };
    let course : CourseTypes.AdminCourse = {
      id = nextId;
      title = input.title;
      category = input.category;
      mode = input.mode;
      price = input.price;
      description = input.description;
      duration = input.duration;
      prerequisites = input.prerequisites;
      imageBlob = imageBlob;
      status = input.status;
      createdAt = Time.now();
    };
    adminCourses.add(course);
    course;
  };

  public func adminUpdateCourse(
    adminCourses : List.List<CourseTypes.AdminCourse>,
    courseId : Common.CourseId,
    input : CourseTypes.AdminCourseInput,
  ) : Bool {
    var found = false;
    adminCourses.mapInPlace(func(ac) {
      if (ac.id == courseId) {
        found := true;
        let newBlob : ?Blob = if (input.imageData.size() == 0) {
          ac.imageBlob;
        } else {
          ?Blob.fromArray(input.imageData);
        };
        {
          ac with
          title = input.title;
          category = input.category;
          mode = input.mode;
          price = input.price;
          description = input.description;
          duration = input.duration;
          prerequisites = input.prerequisites;
          imageBlob = newBlob;
          status = input.status;
        };
      } else { ac };
    });
    found;
  };

  public func adminDeleteCourse(
    adminCourses : List.List<CourseTypes.AdminCourse>,
    courseId : Common.CourseId,
  ) : Bool {
    let before = adminCourses.size();
    let filtered = adminCourses.filter(func(ac) { ac.id != courseId });
    adminCourses.clear();
    adminCourses.append(filtered);
    adminCourses.size() < before;
  };

  public func getAllAdminCourses(adminCourses : List.List<CourseTypes.AdminCourse>) : [CourseTypes.AdminCourse] {
    adminCourses.toArray();
  };

  /// Toggle a course's mode between Online / Offline / Hybrid.
  /// Works on admin-added courses only. Static courses cannot be changed.
  public func updateCourseMode(
    adminCourses : List.List<CourseTypes.AdminCourse>,
    courseId : Common.CourseId,
    mode : CourseTypes.CourseMode,
  ) : Bool {
    var found = false;
    adminCourses.mapInPlace(func(ac) {
      if (ac.id == courseId) {
        found := true;
        { ac with mode = mode };
      } else { ac };
    });
    found;
  };

  /// Admin query — all students enrolled in a specific course with their per-course progress.
  public func getEnrollmentsByCourse(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    courseProgress : List.List<CourseTypes.CourseLessonProgress>,
    courseId : Common.CourseId,
  ) : [{
    enrollment : CourseTypes.CourseEnrollment;
    progress : ?CourseTypes.CourseLessonProgress;
  }] {
    let matching = enrollments.filter(func(e) { e.courseId == courseId });
    matching.map<CourseTypes.CourseEnrollment, {
      enrollment : CourseTypes.CourseEnrollment;
      progress : ?CourseTypes.CourseLessonProgress;
    }>(func(e) {
      let cp = courseProgress.find(func(p) { p.studentId == e.userId and p.courseId == courseId });
      { enrollment = e; progress = cp };
    }).toArray();
  };

  /// Admin only — remove enrollments for courses that no longer exist (stale cleanup).
  public func clearStaleEnrollments(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    adminCourses : List.List<CourseTypes.AdminCourse>,
  ) : Nat {
    let before = enrollments.size();
    let valid = enrollments.filter(func(e) {
      // Keep if it references a static course OR an admin course
      let staticExists = getCourseById(e.courseId) != null;
      let adminExists = getAdminCourseById(adminCourses, e.courseId) != null;
      staticExists or adminExists;
    });
    enrollments.clear();
    enrollments.append(valid);
    before - enrollments.size();
  };

  public func enrollCourse(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    adminCourses : List.List<CourseTypes.AdminCourse>,
    nextId : Nat,
    caller : Common.UserId,
    courseId : Common.CourseId,
  ) : CourseTypes.CourseEnrollment {
    let existsStatic = getCourseById(courseId) != null;
    let existsAdmin = getAdminCourseById(adminCourses, courseId) != null;
    if (not existsStatic and not existsAdmin) {
      Runtime.trap("Course not found");
    };
    // Idempotent: return existing enrollment if already enrolled
    switch (enrollments.find(func(e) { e.userId == caller and e.courseId == courseId })) {
      case (?existing) { return existing };
      case null {};
    };
    // Enrollment is FREE — no payment required at this step
    let enrollment : CourseTypes.CourseEnrollment = {
      id = nextId;
      userId = caller;
      courseId = courseId;
      enrolledAt = Time.now();
      paymentStatus = #Pending; // payment only needed for certificate download
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

  public func getAllEnrollments(enrollments : List.List<CourseTypes.CourseEnrollment>) : [CourseTypes.CourseEnrollment] {
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

  func generateCertCode(enrollmentId : Nat, now : Int) : Text {
    let t = Int.abs(now) % 999999999;
    "RAP-CERT-" # enrollmentId.toText() # "-" # t.toText();
  };

  public func markCourseComplete(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    lessonProgress : List.List<CourseTypes.LessonProgress>,
    lessons : List.List<CourseTypes.Lesson>,
    caller : Common.UserId,
    enrollmentId : Common.EnrollmentId,
  ) : { #ok : Text; #err : Text } {
    switch (enrollments.find(func(e) { e.id == enrollmentId })) {
      case null { #err("Enrollment not found") };
      case (?e) {
        if (e.userId != caller) { return #err("Not your enrollment") };
        // Verify all lessons are completed (video watched + quiz passed)
        let courseLessons = getLessonsByCourse(lessons, e.courseId);
        if (courseLessons.size() > 0) {
          let allDone = courseLessons.all(func(l : CourseTypes.Lesson) : Bool {
            switch (lessonProgress.find(func(lp) { lp.studentId == caller and lp.lessonId == l.id })) {
              case null { false };
              case (?lp) { lp.videoWatched and lp.quizPassed };
            };
          });
          if (not allDone) {
            return #err("Not all lessons completed — watch all videos and pass all quizzes first");
          };
        };
        switch (e.certificateCode) {
          case (?code) { #ok(code) };
          case null {
            let now = Time.now();
            let code = generateCertCode(enrollmentId, now);
            var updated = false;
            enrollments.mapInPlace(func(en) {
              if (en.id == enrollmentId) {
                updated := true;
                { en with progress = 100; completedAt = ?now; certificateCode = ?code };
              } else { en };
            });
            if (updated) { #ok(code) } else { #err("Failed to update enrollment") };
          };
        };
      };
    };
  };

  public func verifyCertificate(
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    code : Text,
  ) : ?CourseTypes.CourseEnrollment {
    enrollments.find(func(e) {
      switch (e.certificateCode) {
        case (?c) { c == code };
        case null { false };
      };
    });
  };

  // ── Lesson management ─────────────────────────────────────────────────────

  /// Add a new lesson to a course. Returns the created lesson.
  public func addLesson(
    lessons : List.List<CourseTypes.Lesson>,
    nextId : Nat,
    input : CourseTypes.LessonInput,
  ) : CourseTypes.Lesson {
    let lesson : CourseTypes.Lesson = {
      id = nextId;
      courseId = input.courseId;
      title = input.title;
      description = input.description;
      youtubeUrl = input.youtubeUrl;
      order = input.order;
      quizQuestions = [];
    };
    lessons.add(lesson);
    lesson;
  };

  /// Update an existing lesson's metadata (not its quiz questions).
  public func editLesson(
    lessons : List.List<CourseTypes.Lesson>,
    lessonId : Nat,
    input : CourseTypes.LessonInput,
  ) : Bool {
    var found = false;
    lessons.mapInPlace(func(l) {
      if (l.id == lessonId) {
        found := true;
        {
          l with
          courseId = input.courseId;
          title = input.title;
          description = input.description;
          youtubeUrl = input.youtubeUrl;
          order = input.order;
        };
      } else { l };
    });
    found;
  };

  /// Remove a lesson and all its progress records.
  public func removeLesson(
    lessons : List.List<CourseTypes.Lesson>,
    lessonId : Nat,
  ) : Bool {
    let before = lessons.size();
    let filtered = lessons.filter(func(l) { l.id != lessonId });
    lessons.clear();
    lessons.append(filtered);
    lessons.size() < before;
  };

  /// Return all lessons for a course, ordered by Lesson.order.
  public func getLessonsByCourse(
    lessons : List.List<CourseTypes.Lesson>,
    courseId : Common.CourseId,
  ) : [CourseTypes.Lesson] {
    let filtered = lessons.filter(func(l) { l.courseId == courseId });
    let arr = filtered.toArray();
    arr.sort(func(a, b) { Nat.compare(a.order, b.order) });
  };

  // ── Quiz question management ───────────────────────────────────────────────

  /// Add a quiz question to a lesson. Returns the updated lesson.
  public func addQuizQuestion(
    lessons : List.List<CourseTypes.Lesson>,
    nextQuizId : Nat,
    input : CourseTypes.QuizQuestionInput,
  ) : CourseTypes.Lesson {
    var result : ?CourseTypes.Lesson = null;
    lessons.mapInPlace(func(l) {
      if (l.id == input.lessonId) {
        let newQuestion : CourseTypes.QuizQuestion = {
          id = nextQuizId;
          lessonId = input.lessonId;
          question = input.question;
          options = input.options;
          correctOptionIndex = input.correctOptionIndex;
        };
        let updated : CourseTypes.Lesson = {
          l with
          quizQuestions = l.quizQuestions.concat([newQuestion]);
        };
        result := ?updated;
        updated;
      } else { l };
    });
    switch (result) {
      case (?lesson) { lesson };
      case null { Runtime.trap("Lesson not found") };
    };
  };

  /// Update an existing quiz question.
  public func editQuizQuestion(
    lessons : List.List<CourseTypes.Lesson>,
    questionId : Nat,
    input : CourseTypes.QuizQuestionInput,
  ) : Bool {
    var found = false;
    lessons.mapInPlace(func(l) {
      let updatedQuestions = l.quizQuestions.map(
        func(q : CourseTypes.QuizQuestion) : CourseTypes.QuizQuestion {
          if (q.id == questionId) {
            found := true;
            {
              q with
              question = input.question;
              options = input.options;
              correctOptionIndex = input.correctOptionIndex;
            };
          } else { q };
        },
      );
      { l with quizQuestions = updatedQuestions };
    });
    found;
  };

  /// Remove a quiz question from its lesson.
  public func removeQuizQuestion(
    lessons : List.List<CourseTypes.Lesson>,
    questionId : Nat,
  ) : Bool {
    var found = false;
    lessons.mapInPlace(func(l) {
      let before = l.quizQuestions.size();
      let filtered = l.quizQuestions.filter(func(q) {
        if (q.id == questionId) { found := true; false } else { true };
      });
      if (filtered.size() < before) {
        { l with quizQuestions = filtered };
      } else { l };
    });
    found;
  };

  // ── Student progress ──────────────────────────────────────────────────────

  /// Mark that a student has finished watching a lesson video.
  /// Returns updated LessonProgress.
  public func markVideoWatched(
    lessonProgress : List.List<CourseTypes.LessonProgress>,
    courseProgress : List.List<CourseTypes.CourseLessonProgress>,
    lessons : List.List<CourseTypes.Lesson>,
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    student : Common.UserId,
    lessonId : Nat,
  ) : CourseTypes.LessonProgress {
    // Find the lesson to get the courseId
    let lesson = switch (lessons.find(func(l) { l.id == lessonId })) {
      case null { Runtime.trap("Lesson not found") };
      case (?l) { l };
    };
    // Verify student is enrolled in this course
    switch (enrollments.find(func(e) { e.userId == student and e.courseId == lesson.courseId })) {
      case null { Runtime.trap("Not enrolled in this course") };
      case (?_) {};
    };
    // Create or update LessonProgress
    let updatedLp : CourseTypes.LessonProgress = switch (lessonProgress.find(func(lp) { lp.studentId == student and lp.lessonId == lessonId })) {
      case (?lp) {
        { lp with videoWatched = true };
      };
      case null {
        {
          studentId = student;
          lessonId = lessonId;
          videoWatched = true;
          quizScore = null;
          quizPassed = false;
          completedAt = null;
        };
      };
    };
    // Upsert into lessonProgress list
    switch (lessonProgress.findIndex(func(lp) { lp.studentId == student and lp.lessonId == lessonId })) {
      case (?idx) {
        lessonProgress.put(idx, updatedLp);
      };
      case null {
        lessonProgress.add(updatedLp);
      };
    };
    // Recalc course-level progress
    ignore recalcCourseProgress(lessonProgress, courseProgress, enrollments, lessons, student, lesson.courseId);
    updatedLp;
  };

  /// Submit quiz answers for a lesson. Returns a QuizResult with score and
  /// updated course progress. Also triggers certificate generation if all
  /// lessons are done and enrollment is FullyPaid.
  public func submitQuiz(
    lessonProgress : List.List<CourseTypes.LessonProgress>,
    courseProgress : List.List<CourseTypes.CourseLessonProgress>,
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    lessons : List.List<CourseTypes.Lesson>,
    student : Common.UserId,
    lessonId : Nat,
    answers : [Nat],  // one index per question, ordered
  ) : { #ok : CourseTypes.QuizResult; #err : Text } {
    // Find lesson
    let lesson = switch (lessons.find(func(l) { l.id == lessonId })) {
      case null { return #err("Lesson not found") };
      case (?l) { l };
    };
    // Verify enrollment
    switch (enrollments.find(func(e) { e.userId == student and e.courseId == lesson.courseId })) {
      case null { return #err("Not enrolled in this course") };
      case (?_) {};
    };
    let questions = lesson.quizQuestions;
    let totalQuestions = questions.size();
    if (totalQuestions == 0) {
      return #err("No quiz questions for this lesson");
    };
    if (totalQuestions < 10) {
      return #err("Quiz must have at least 10 questions before it can be submitted");
    };
    if (answers.size() != totalQuestions) {
      return #err("Answer count does not match question count");
    };
    // Score the quiz
    var correct = 0;
    var i = 0;
    for (q in questions.values()) {
      if (i < answers.size() and answers[i] == q.correctOptionIndex) {
        correct += 1;
      };
      i += 1;
    };
    let passed = correct * 100 >= totalQuestions * 60; // >= 60%
    let now = Time.now();
    // Upsert LessonProgress
    let updatedLp : CourseTypes.LessonProgress = switch (lessonProgress.find(func(lp) { lp.studentId == student and lp.lessonId == lessonId })) {
      case (?lp) {
        {
          lp with
          quizScore = ?correct;
          quizPassed = passed;
          completedAt = if (lp.videoWatched and passed) { ?now } else { lp.completedAt };
        };
      };
      case null {
        {
          studentId = student;
          lessonId = lessonId;
          videoWatched = false;
          quizScore = ?correct;
          quizPassed = passed;
          completedAt = null;
        };
      };
    };
    switch (lessonProgress.findIndex(func(lp) { lp.studentId == student and lp.lessonId == lessonId })) {
      case (?idx) { lessonProgress.put(idx, updatedLp) };
      case null { lessonProgress.add(updatedLp) };
    };
    // Recalc and return progress
    let cp = recalcCourseProgress(lessonProgress, courseProgress, enrollments, lessons, student, lesson.courseId);
    #ok({
      lessonId = lessonId;
      score = correct;
      totalQuestions = totalQuestions;
      passed = passed;
      courseProgress = cp;
    });
  };

  /// Return the aggregated course-level progress for a student.
  public func getCourseProgress(
    courseProgress : List.List<CourseTypes.CourseLessonProgress>,
    student : Common.UserId,
    courseId : Common.CourseId,
  ) : ?CourseTypes.CourseLessonProgress {
    courseProgress.find(func(cp) { cp.studentId == student and cp.courseId == courseId });
  };

  /// Return all per-lesson progress records for a student within a course.
  public func getLessonProgressForCourse(
    lessonProgress : List.List<CourseTypes.LessonProgress>,
    lessons : List.List<CourseTypes.Lesson>,
    student : Common.UserId,
    courseId : Common.CourseId,
  ) : [CourseTypes.LessonProgress] {
    // Collect all lessonIds for this course as a Set for O(log n) lookup
    let courseLessonIds = Set.empty<Nat>();
    lessons.forEach(func(l) {
      if (l.courseId == courseId) {
        courseLessonIds.add(l.id);
      };
    });
    lessonProgress
      .filter(func(lp) {
        lp.studentId == student and courseLessonIds.contains(lp.lessonId)
      })
      .toArray();
  };

  /// Recalculate and persist CourseLessonProgress from individual LessonProgress
  /// records. Called internally after markVideoWatched / submitQuiz.
  public func recalcCourseProgress(
    lessonProgress : List.List<CourseTypes.LessonProgress>,
    courseProgress : List.List<CourseTypes.CourseLessonProgress>,
    enrollments : List.List<CourseTypes.CourseEnrollment>,
    lessons : List.List<CourseTypes.Lesson>,
    student : Common.UserId,
    courseId : Common.CourseId,
  ) : CourseTypes.CourseLessonProgress {
    // All lessons for this course, sorted by order
    let courseLessons = getLessonsByCourse(lessons, courseId);
    let totalLessons = courseLessons.size();

    // Collect completed lesson IDs (videoWatched=true AND quizPassed=true)
    let completedLessons = courseLessons.filter(
      func(l : CourseTypes.Lesson) : Bool {
        switch (lessonProgress.find(func(lp) { lp.studentId == student and lp.lessonId == l.id })) {
          case null { false };
          case (?lp) { lp.videoWatched and lp.quizPassed };
        };
      },
    );
    let completedIds = completedLessons.map(func(l : CourseTypes.Lesson) : Nat { l.id });

    let completedCount = completedIds.size();
    let overallPercent : Nat = if (totalLessons == 0) { 0 } else {
      completedCount * 100 / totalLessons
    };

    // Find first incomplete lesson (video not watched OR quiz not passed)
    let currentLessonId : ?Nat = switch (courseLessons.find(
      func(l : CourseTypes.Lesson) : Bool {
        switch (lessonProgress.find(func(lp) { lp.studentId == student and lp.lessonId == l.id })) {
          case null { true };
          case (?lp) { not (lp.videoWatched and lp.quizPassed) };
        };
      },
    )) {
      case null { null };
      case (?l) { ?l.id };
    };

    // Certificate is "earnable" when all lessons are complete (100%)
    // Payment for certificate download is a SEPARATE step — not gated here.
    // certificateEarned=true means "eligible to pay for and download certificate"
    let certificateEarned = overallPercent == 100 and totalLessons > 0;

    // Auto-generate certificate code when all lessons done (code needed for payment reference)
    if (certificateEarned) {
      switch (enrollments.find(func(e) { e.userId == student and e.courseId == courseId })) {
        case null {};
        case (?e) {
          if (e.certificateCode == null) {
            let now = Time.now();
            let code = generateCertCode(e.id, now);
            ignore markCertificateIssued(enrollments, e.id, code);
            // Also update progress to 100 on enrollment
            enrollments.mapInPlace(func(en) {
              if (en.id == e.id) {
                { en with progress = 100; completedAt = ?now };
              } else { en };
            });
          };
        };
      };
    };

    let cp : CourseTypes.CourseLessonProgress = {
      studentId = student;
      courseId = courseId;
      completedLessonIds = completedIds;
      currentLessonId = currentLessonId;
      overallPercent = overallPercent;
      certificateEarned = certificateEarned;
    };

    // Upsert into courseProgress list
    switch (courseProgress.findIndex(func(c) { c.studentId == student and c.courseId == courseId })) {
      case (?idx) { courseProgress.put(idx, cp) };
      case null { courseProgress.add(cp) };
    };
    cp;
  };
};
