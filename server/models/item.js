const itemSchema = require("./itemSchema");

//const mongoose = require("mongoose");

//const Item = mongoose.model("Item", itemSchema);

//module.exports = Item;


module.exports = (connection) => connection.model("Item", itemSchema)
