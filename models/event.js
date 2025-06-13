const mongoose = require("mongoose");

const EventSchema = mongoose.Schema(
  {
    eventName: { type: String, required: true },
    eventOrg: { type: String },
    eventType: { type: String, required: true },
    eventDesc: { type: String, required: true },
    eventDate: { type: Date },
    eventId: { type: String },
    eventVideoLink: { type: String },
    eventImageLink: { type: String }
  },
  { collection: "events" }
);

module.exports = mongoose.model("Event", EventSchema);
