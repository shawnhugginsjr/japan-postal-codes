var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    postalCodeString = req.query.postal_code
    if (postalCodeString == null) {
      res.render('index', { title: 'Search for a Japan Postal Code' });
      return
    }
    postalCode = await req.db.get('SELECT * FROM postal_codes WHERE postal_code = ?', postalCodeString)
    if (postalCode) {
      res.render('postal_code', {postalCode: postalCode})
    } else {
      res.render('not_found', { searchedPostalCode: postalCodeString });
    }
  } catch(err) {
    next(err)
  }
});

module.exports = router;
