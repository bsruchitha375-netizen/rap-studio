// Migration: adds adminNotes : ?Text field to PaymentOrder
// Old PaymentOrder lacked this field; we default it to null for all existing records.
import Prim "mo:⛔";
import PaymentTypes "types/payments";

module {
  // ── Old types (from backend.most snapshot) ───────────────────────────────
  type Nat_ = Nat;
  type Timestamp = Int;
  type UserId = Principal;
  type PaymentId = Nat;
  type BookingId = Nat;
  type EnrollmentId = Nat;
  type NotificationId = Nat;
  type CertificateId = Nat;
  type MediaId = Nat;

  type PaymentStatus = { #Created; #Paid; #Failed; #Refunded };
  type PaymentType = { #BookingUpfront; #BookingBalance; #CourseEnrollment };

  // Old PaymentOrder — no adminNotes field
  type OldPaymentOrder = {
    id : PaymentId;
    orderId : Text;
    stripeSessionId : ?Text;
    stripePaymentIntentId : ?Text;
    amount : Nat;
    currency : Text;
    status : PaymentStatus;
    paymentType : PaymentType;
    referenceId : Text;
    userId : UserId;
    createdAt : Timestamp;
    paidAt : ?Timestamp;
    signatureVerified : Bool;
    verifiedAt : ?Timestamp;
    checkoutUrl : ?Text;
  };

  // List internal structure (mo:core/List)
  type OldListPaymentOrder = {
    var blockIndex : Nat_;
    var blocks : [var [var ?OldPaymentOrder]];
    var elementIndex : Nat_;
  };

  type NewListPaymentOrder = {
    var blockIndex : Nat_;
    var blocks : [var [var ?PaymentTypes.PaymentOrder]];
    var elementIndex : Nat_;
  };

  // ── OldActor / NewActor stable-field records ─────────────────────────────
  // Only include fields that change; unchanged fields are inherited automatically.
  type OldActor = {
    paymentOrders : OldListPaymentOrder;
  };

  type NewActor = {
    paymentOrders : NewListPaymentOrder;
  };

  // Migrate a single old PaymentOrder to the new shape
  func migrateOrder(old : OldPaymentOrder) : PaymentTypes.PaymentOrder {
    {
      id = old.id;
      orderId = old.orderId;
      stripeSessionId = old.stripeSessionId;
      stripePaymentIntentId = old.stripePaymentIntentId;
      amount = old.amount;
      currency = old.currency;
      status = old.status;
      paymentType = old.paymentType;
      referenceId = old.referenceId;
      userId = old.userId;
      createdAt = old.createdAt;
      paidAt = old.paidAt;
      signatureVerified = old.signatureVerified;
      verifiedAt = old.verifiedAt;
      checkoutUrl = old.checkoutUrl;
      adminNotes = null;
    }
  };

  // Migrate one inner block of ?OldPaymentOrder to ?NewPaymentOrder
  func migrateBlock(block : [var ?OldPaymentOrder]) : [var ?PaymentTypes.PaymentOrder] {
    let newBlock = Prim.Array_init<?PaymentTypes.PaymentOrder>(block.size(), null);
    var i = 0;
    while (i < block.size()) {
      newBlock[i] := switch (block[i]) {
        case null { null };
        case (?old) { ?migrateOrder(old) };
      };
      i += 1;
    };
    newBlock
  };

  public func run(old : OldActor) : NewActor {
    let oldBlocks = old.paymentOrders.blocks;
    let newBlocks = Prim.Array_init<[var ?PaymentTypes.PaymentOrder]>(oldBlocks.size(), [var]);
    var i = 0;
    while (i < oldBlocks.size()) {
      newBlocks[i] := migrateBlock(oldBlocks[i]);
      i += 1;
    };

    let newList : NewListPaymentOrder = {
      var blockIndex = old.paymentOrders.blockIndex;
      var blocks = newBlocks;
      var elementIndex = old.paymentOrders.elementIndex;
    };

    { paymentOrders = newList };
  };
};
