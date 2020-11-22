const basefunc = require('@libs/basefunc');

module.exports = {
  addCustomer: function(customer) {
    customerData = {
      email: customer.email,
      customer_service_id: customer.service_id,
      added_time: basefunc.getCurrentTimestamp()
    };
    var query = "INSERT INTO customers SET ?";
    return new Promise(function(resolve, reject) {
      db.query(query, customerData, function(err, result) {
        if(err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  findByEmail: function(email) {
    var query = "SELECT * FROM customers WHERE email = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [email], function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
};