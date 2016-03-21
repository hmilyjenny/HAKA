
/**
 * User schema
 */

var Mongoose = require('mongoose');
var Bcrypt = require('bcrypt');


var Schema = Mongoose.Schema;


var userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  dob: Date,
  name: String,
  registered: {type: Date, default: Date.now},
  lastActive: {type: Date, default: Date.now}
});

userSchema.methods.validPassword = function (password, ifValid, ifInvalid) {
  Bcrypt.compare(password, this.password, function (err, res) {
    if (res) ifValid();
    else ifInvalid();
  })
};

var User = Mongoose.model('User', userSchema);

module.exports = User;