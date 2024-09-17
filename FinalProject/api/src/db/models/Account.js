module.exports = class Account {
    id = null;
    username = null;
    password = null;
    notes = null;

    constructor(data) {
      this.id = data.act_id;
      this.username = data.act_username;
      this.password = data.act_password;
      this.notes = data.act_notes;
    }
  
  };