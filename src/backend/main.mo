import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";

actor {
  type PaymentRecord = {
    id : Nat;
    name : Text;
    age : Nat;
    mobile : Text;
    status : Text;
    timestamp : Int;
  };

  module PaymentRecord {
    public func compareByTimestamp(a : PaymentRecord, b : PaymentRecord) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  let payments = Map.empty<Nat, PaymentRecord>();

  var nextId = 0;
  let sessionPrefix = "session_";
  var adminLoggedIn = false;

  public shared ({ caller }) func submitUserDetails(name : Text, age : Nat, mobile : Text) : async Text {
    let sessionId = sessionPrefix.concat(nextId.toText());
    let newPayment : PaymentRecord = {
      id = nextId;
      name;
      age;
      mobile;
      status = "submitted";
      timestamp = Time.now();
    };

    payments.add(nextId, newPayment);
    nextId += 1;
    sessionId;
  };

  public shared ({ caller }) func claimPayment(sessionId : Text) : async Bool {
    let idText = sessionId.replace(#text(sessionPrefix), "");
    let id = switch (Nat.fromText(idText)) {
      case (null) { return false };
      case (?value) { value };
    };

    switch (payments.get(id)) {
      case (null) { false };
      case (?payment) {
        if (payment.status == "submitted") {
          let updatedPayment : PaymentRecord = {
            id = payment.id;
            name = payment.name;
            age = payment.age;
            mobile = payment.mobile;
            status = "waiting";
            timestamp = Time.now();
          };
          payments.add(id, updatedPayment);
          true;
        } else {
          false;
        };
      };
    };
  };

  public query ({ caller }) func getPaymentStatus(sessionId : Text) : async Text {
    let idText = sessionId.replace(#text(sessionPrefix), "");
    let id = switch (Nat.fromText(idText)) {
      case (null) { Runtime.trap("Invalid sessionId") };
      case (?value) { value };
    };

    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment record not found") };
      case (?payment) { payment.status };
    };
  };

  public shared ({ caller }) func adminLogin(password : Text) : async Bool {
    if (password == "admin123") {
      adminLoggedIn := true;
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getPendingPayments() : async [PaymentRecord] {
    payments.values().toArray().sort(PaymentRecord.compareByTimestamp);
  };

  public shared ({ caller }) func approvePayment(sessionId : Text, approved : Bool) : async Bool {
    if (not adminLoggedIn) {
      Runtime.trap("Admin not logged in");
    };

    let idText = sessionId.replace(#text(sessionPrefix), "");
    let id = switch (Nat.fromText(idText)) {
      case (null) { return false };
      case (?value) { value };
    };

    switch (payments.get(id)) {
      case (null) { false };
      case (?payment) {
        if (payment.status != "waiting") {
          return false;
        };

        let newStatus = if (approved) { "approved" } else { "rejected" };
        let updatedPayment : PaymentRecord = {
          id = payment.id;
          name = payment.name;
          age = payment.age;
          mobile = payment.mobile;
          status = newStatus;
          timestamp = Time.now();
        };
        payments.add(id, updatedPayment);
        true;
      };
    };
  };
};
