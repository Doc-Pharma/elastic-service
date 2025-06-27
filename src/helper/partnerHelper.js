// orderHelper.js
const BaseHelper = require('./baseHelper');
const { partner } = require('../config/database');

class PartnerHelper extends BaseHelper {
  constructor() {
    super(partner);
  }

  // Function specific to this helper can be specified here
}
const partnerHelper = new PartnerHelper();
module.exports = partnerHelper;
