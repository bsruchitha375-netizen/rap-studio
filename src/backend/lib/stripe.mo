import OutCall "mo:caffeineai-http-outcalls/outcall";
import Text "mo:core/Text";
import List "mo:core/List";

// Stripe API helpers — called from payments-api mixin.
// Handles Stripe Checkout Session creation and status queries via HTTP outcalls.
module {
  // Creates a Stripe Checkout Session for the given amount (in paise/smallest unit).
  // Returns the raw JSON response from Stripe — the mixin extracts session.id and session.url.
  public func createCheckoutSession(
    transform : OutCall.Transform,
    secretKey : Text,
    amount : Nat,
    currency : Text,
    successUrl : Text,
    cancelUrl : Text,
    metadata : [(Text, Text)],
  ) : async Text {
    let auth = basicAuthHeader(secretKey);
    var params : [(Text, Text)] = [
      ("payment_method_types[]", "card"),
      ("line_items[0][price_data][currency]", currency),
      ("line_items[0][price_data][unit_amount]", amount.toText()),
      ("line_items[0][price_data][product_data][name]", "RAP Studio Booking"),
      ("line_items[0][quantity]", "1"),
      ("mode", "payment"),
      ("success_url", successUrl),
      ("cancel_url", cancelUrl),
    ];
    // Append metadata
    var i = 0;
    for ((k, v) in metadata.vals()) {
      params := params.concat([("metadata[" # k # "]", v)]);
      i += 1;
    };
    let body = encodeFormBody(params);
    await OutCall.httpPostRequest(
      "https://api.stripe.com/v1/checkout/sessions",
      [
        { name = "Authorization"; value = "Basic " # auth },
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
      ],
      body,
      transform,
    );
  };

  // Retrieves a Stripe Checkout Session by ID and returns the raw JSON.
  // Used to confirm payment status server-side before marking an order as Paid.
  public func retrieveCheckoutSession(
    transform : OutCall.Transform,
    secretKey : Text,
    sessionId : Text,
  ) : async Text {
    let auth = basicAuthHeader(secretKey);
    await OutCall.httpGetRequest(
      "https://api.stripe.com/v1/checkout/sessions/" # sessionId,
      [{ name = "Authorization"; value = "Basic " # auth }],
      transform,
    );
  };

  // Encodes key=value pairs as application/x-www-form-urlencoded body
  // (required format for Stripe API calls).
  public func encodeFormBody(params : [(Text, Text)]) : Text {
    var result = "";
    var first = true;
    for ((k, v) in params.vals()) {
      if (not first) { result #= "&" };
      result #= urlEncode(k) # "=" # urlEncode(v);
      first := false;
    };
    result;
  };

  // Returns the Basic auth header value (base64-encoded "key:") for Stripe API calls.
  public func basicAuthHeader(secretKey : Text) : Text {
    base64Encode(secretKey # ":");
  };

  // URL-encodes a text value for form submissions.
  // Encodes special characters that are not allowed in query strings.
  func urlEncode(input : Text) : Text {
    var result = "";
    for (c in input.toIter()) {
      let encoded = switch (c) {
        case ' ' { "%20" };
        case '!' { "%21" };
        case '\"' { "%22" };
        case '#' { "%23" };
        case '$' { "%24" };
        case '%' { "%25" };
        case '&' { "%26" };
        case '\'' { "%27" };
        case '(' { "%28" };
        case ')' { "%29" };
        case '*' { "%2A" };
        case '+' { "%2B" };
        case ',' { "%2C" };
        case '/' { "%2F" };
        case ':' { "%3A" };
        case ';' { "%3B" };
        case '=' { "%3D" };
        case '?' { "%3F" };
        case '@' { "%40" };
        case '[' { "%5B" };
        case ']' { "%5D" };
        case _ { Text.fromChar(c) };
      };
      result #= encoded;
    };
    result;
  };

  // Extracts a JSON string value for a given key from a flat JSON object.
  // e.g. extractJsonField("{\"id\":\"cs_123\",\"url\":\"http://...\"}", "url") -> ?"http://..."
  public func extractJsonField(json : Text, field : Text) : ?Text {
    let needle = "\"" # field # "\":\"";
    switch (json.stripStart(#text "")) {
      case _ {};
    };
    // Find the field key
    let parts = json.split(#text needle);
    let arr = parts.toArray();
    if (arr.size() < 2) { return null };
    let rest = arr[1];
    // rest starts at the value — find closing quote
    let valueParts = rest.split(#text "\"");
    let vArr = valueParts.toArray();
    if (vArr.size() == 0) { return null };
    ?vArr[0];
  };

  // Base64 encoding for Basic auth header (RFC 4648)
  func base64Encode(input : Text) : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let charsArr = chars.toArray();
    let blobBytes = input.encodeUtf8();
    let bList = List.empty<Nat>();
    for (byte in blobBytes.vals()) {
      bList.add(byte.toNat());
    };
    let bArr = bList.toArray();
    let len = bArr.size();
    var result = "";
    var idx = 0;
    while (idx < len) {
      let b0 = bArr[idx];
      let b1 : Nat = if (idx + 1 < len) bArr[idx + 1] else 0;
      let b2 : Nat = if (idx + 2 < len) bArr[idx + 2] else 0;
      let count : Nat = if (idx + 2 < len) 3 else if (idx + 1 < len) 2 else 1;
      result #= Text.fromChar(charsArr[b0 / 4]);
      result #= Text.fromChar(charsArr[((b0 % 4) * 16) + (b1 / 16)]);
      result #= if (count >= 2) Text.fromChar(charsArr[((b1 % 16) * 4) + (b2 / 64)]) else "=";
      result #= if (count >= 3) Text.fromChar(charsArr[b2 % 64]) else "=";
      idx += 3;
    };
    result;
  };
};
