module.exports = class Provider {
    id = null;
    name = null;
    accounts = null;

    constructor(data) {
      this.id = data.prv_id;
      this.name = data.prv_name;
      this.accounts = data.prv_accounts;
    }
  
  };