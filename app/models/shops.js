const basefunc = require('@libs/basefunc');

module.exports = {
  addShop: function(shop, accessToken) {
    this.findByName(shop)
      .then((shopData) => {
        this.deleteActive();
        if(shopData) {
          this.updateShop(shop, accessToken);
          return;
        }
        shopData = {
          shop_origin: shop,
          access_token: accessToken,
          active: 1,
          added_time: basefunc.getCurrentTimestamp()
        };
        var query = "INSERT INTO shops SET ?";
        return new Promise(function(resolve, reject) {
          db.query(query, shopData, function(err, result) {
            if(err)
              return reject(err);
            return resolve(result);
          });
        });
      });
  },
  findByName: function(shop) {
    var query = "SELECT * FROM shops WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, shop, function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  findActiveShop: function(shop) {
    var query = "SELECT * FROM shops WHERE active = 1";
    return new Promise(function(resolve, reject) {
      db.query(query, shop, function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  updateShop: function(shop, accessToken) {
    var query = "UPDATE shops SET access_token = ?, active = 1 WHERE shop_origin = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [accessToken, shop], function(err, result) {
        if(err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  deleteActive: function() {
    var query = "UPDATE shops set active = 0;";
    return new Promise(function(resolve, reject) {
      db.query(query, function(err, result) {
        if(err)
          return reject(err);
        return resolve(result);
      });
    });
  }
};