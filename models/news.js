const mongoose = require("mongoose");

const NewsUpdates = mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    },
    ImageLink: {
        type: String,
    },
    ID:{
        type:String,
        required:true,
        unique: true
    }

},
    { collection: "news_Updates" }
);

module.exports = mongoose.model("news_Updates", NewsUpdates);
