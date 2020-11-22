const basefunc = require('@libs/basefunc');

module.exports = {
  addServer: function(server) {
    this.findByData(server)
      .then((serverData) => {
        this.deleteActive();
        if(serverData) {
          this.updateServer(server);
          return;
        }
        serverData = {
          key_service: server.key_service,
          company_id: server.company_id,
          user_id: server.user_id,
          option: parseInt(server.option),
          active: 1,
          added_time: basefunc.getCurrentTimestamp()
        };
        var query = "INSERT INTO servers SET ?";
        return new Promise(function(resolve, reject) {
          db.query(query, serverData, function(err, result) {
            if(err)
              return reject(err);
            return resolve(result);
          });
        });
      });
  },
  findByData: function(server) {
    var query = "SELECT * FROM servers WHERE key_service = ? and company_id = ? and user_id = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [server.key_service, server.company_id, server.user_id], function(err, result) {
        if(err)
          return reject(err);
        if(result.length > 0)
          return resolve(result[0]);
        else
          return resolve(null);
      });
    });
  },
  updateServer: function(server) {
    var query = "UPDATE servers SET active = 1, option = ? WHERE key_service = ? and company_id = ? and user_id = ?";
    return new Promise(function(resolve, reject) {
      db.query(query, [parseInt(server.option), server.key_service, server.company_id, server.user_id], function(err, result) {
        if(err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  deleteActive: function() {
    var query = "UPDATE servers set active = 0;";
    return new Promise(function(resolve, reject) {
      db.query(query, function(err, result) {
        if(err)
          return reject(err);
        return resolve(result);
      });
    });
  },
  getActiveServer: function(server) {
    var query = "SELECT * FROM servers WHERE active = 1";
    return new Promise(function(resolve, reject) {
      db.query(query, function(err, result) {
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