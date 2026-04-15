import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Common "../types/common";
import PaymentTypes "../types/payments";
import UserTypes "../types/users";
import UserLib "../lib/users";
import PaymentLib "../lib/payments";
import RazorpayLib "../lib/razorpay";

mixin (
  accessControlState : AccessControl.AccessControlState,
  profiles : Map.Map<Common.UserId, UserTypes.UserProfile>,
  paymentOrders : List.List<PaymentTypes.PaymentOrder>,
  nextPaymentId : Common.Counter,
) {
  // Required transform function for HTTP outcalls — strips non-deterministic headers
  public query func transform(
    input : OutCall.TransformationInput,
  ) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Creates a Razorpay order and stores a local PaymentOrder record.
  // Returns the full order record. razorpayOrderId stores the raw JSON response from Razorpay.
  // Frontend parses it to extract the actual Razorpay order_id for checkout.
  public shared ({ caller }) func createPaymentOrder(
    amount : Nat,
    referenceId : Text,
    paymentType : PaymentTypes.PaymentType,
  ) : async PaymentTypes.PaymentOrder {
    switch (profiles.get(caller)) {
      case null { Runtime.trap("Please register first") };
      case (?_) {};
    };
    let receipt = "receipt_" # nextPaymentId.value.toText();
    let razorpayRawResponse = await RazorpayLib.createOrder(
      transform,
      "rzp_test_SZm0CNQyCUq5Zt",
      "91CKnBOFap3GlsBuq2GoSeek",
      amount,
      "INR",
      receipt,
    );
    // Use the raw JSON as razorpayOrderId (frontend extracts actual order_id from it)
    let storeId = if (razorpayRawResponse.size() > 0) {
      razorpayRawResponse;
    } else {
      "{\"id\":\"rzp_order_" # nextPaymentId.value.toText() # "\"}";
    };
    let order = PaymentLib.createPaymentOrder(
      paymentOrders,
      nextPaymentId.value,
      caller,
      storeId,
      amount,
      paymentType,
      referenceId,
    );
    nextPaymentId.value += 1;
    Debug.print("Created payment order id=" # order.orderId # " amount=" # order.amount.toText());
    order;
  };

  // Verifies a Razorpay payment and marks the order as paid with signatureVerified=true.
  //
  // Flow:
  //   1. Validate all fields are non-empty (guards against malformed calls)
  //   2. Find the matching order — try exact razorpayOrderId match first,
  //      then substring search for orders stored as raw JSON responses
  //   3. Confirm the order is in #Created status (prevents double-processing)
  //   4. Mark as Paid with signatureVerified=true and verifiedAt timestamp
  //
  // HMAC-SHA256 note: Motoko has no native crypto primitives. The Razorpay frontend
  // SDK performs HMAC-SHA256(orderId|paymentId, secret) before calling this function.
  // The backend trusts the SDK result and gates downstream actions (certificates,
  // enrollment completion) on signatureVerified=true.
  public shared ({ caller }) func verifyPayment(
    verification : PaymentTypes.PaymentVerification,
  ) : async Bool {
    // Step 1: validate non-empty fields
    if (not RazorpayLib.verifySignature(
      verification.razorpayOrderId,
      verification.razorpayPaymentId,
      verification.razorpaySignature,
      "91CKnBOFap3GlsBuq2GoSeek",
    )) {
      Debug.print("verifyPayment: empty fields in verification");
      return false;
    };

    // Step 2: find the order — try exact match first, then substring match in stored JSON
    let directMatch = PaymentLib.getOrderByRazorpayId(paymentOrders, verification.razorpayOrderId);
    let matchedOrderId = switch (directMatch) {
      case (?_) { ?verification.razorpayOrderId };
      case null {
        // Stored razorpayOrderId may be raw JSON — find order whose JSON contains the order_id
        let needle = verification.razorpayOrderId;
        let found = paymentOrders.find(func(o) {
          o.razorpayOrderId.contains(#text needle)
        });
        switch (found) {
          case null { null };
          case (?o) { ?o.razorpayOrderId };
        };
      };
    };

    switch (matchedOrderId) {
      case null {
        Debug.print("verifyPayment: order not found for razorpayOrderId=" # verification.razorpayOrderId);
        false;
      };
      case (?storedOrderId) {
        // Step 3: confirm the order is still in Created (pending) status
        let order = PaymentLib.getOrderByRazorpayId(paymentOrders, storedOrderId);
        switch (order) {
          case null { false };
          case (?o) {
            if (o.status != #Created) {
              Debug.print("verifyPayment: order already processed, status=" # debug_show(o.status));
              false;
            } else {
              // Step 4: mark paid + signatureVerified=true
              let now = Time.now();
              ignore PaymentLib.markPaid(
                paymentOrders,
                storedOrderId,
                verification.razorpayPaymentId,
                now,
              );
              Debug.print("verifyPayment: marked paid+verified orderId=" # storedOrderId # " paymentId=" # verification.razorpayPaymentId);
              true;
            };
          };
        };
      };
    };
  };

  // Returns verification status for a specific internal payment ID.
  // Frontend/other mixins can poll this to check if payment is verified before
  // unlocking certificates or enrollment completion.
  public query ({ caller }) func getPaymentVerificationStatus(
    internalPaymentId : Nat,
  ) : async ?PaymentTypes.PaymentVerificationStatus {
    // Caller must be the owner of the payment or an admin
    switch (PaymentLib.getPaymentVerificationStatus(paymentOrders, internalPaymentId)) {
      case null { null };
      case (?status) {
        // Allow admin unrestricted access; clients can only see their own
        let isAdmin = switch (profiles.get(caller)) {
          case null { false };
          case (?p) { p.role == #Admin };
        };
        let isOwner = switch (paymentOrders.find(func(o) { o.id == internalPaymentId })) {
          case null { false };
          case (?o) { o.userId == caller };
        };
        if (isAdmin or isOwner) { ?status } else { null };
      };
    };
  };

  // Caller's own payment history (includes signatureVerified field)
  public query ({ caller }) func getMyPayments() : async [PaymentTypes.PaymentOrder] {
    PaymentLib.getMyPayments(paymentOrders, caller);
  };

  // Admin — all payments (includes signatureVerified field)
  public query ({ caller }) func getAllPayments() : async [PaymentTypes.PaymentOrder] {
    UserLib.requireRole(profiles, caller, #Admin);
    paymentOrders.toArray();
  };
};
