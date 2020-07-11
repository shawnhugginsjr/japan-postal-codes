var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    count = await req.db.get("SELECT COUNT(*) as rows FROM postal_codes")
    console.log(count)
    res.render('index', { title: 'Express' });
  } catch(err) {
    next(err)
  }
});

module.exports = router;
