var express = require('express');
var router = express.Router();
var network = require('../network')

postalCodeRegex = /\d\d\d-\d\d\d\d/
postalCodeLength = 8
sqlNearPostalCodes = "SELECT child.* FROM postal_codes as child, (SELECT id FROM postal_codes WHERE postal_code = ?) as parent WHERE child.id BETWEEN parent.id-2 AND parent.id+2;"


router.get('/', async (req, res, next) => {
  try {
    postalCodeString = req.query.postal_code
    if (postalCodeString == null) {
      res.render('index', { title: 'Search for a Japan Postal Code' });
      return
    }

    if (postalCodeString.length !== postalCodeLength || postalCodeString.search(postalCodeRegex) === -1) {
      res.render('postal_code', {
        searchedPostalCode: postalCodeString,
        error: `'${postalCodeString}' is an invalid Postal Code.}`
      })
      return
    }

    postCodeData = await network.fetchPostcodeData(postalCodeString)
    if (postCodeData.status === 204) {
      res.render('postal_code', {
        searchedPostalCode: postalCodeString,
        error: `Postal Code '${postalCodeString}' could not be found.`
      })
    }

    lat = postCodeData.data.location.latitude
    lon = postCodeData.data.location.longitude
    weatherPromise = network.fetchWeatherData(lat, lon)
    nearPostalCodesPromise = req.db.all(sqlNearPostalCodes, postalCodeString)

    Promise.allSettled([weatherPromise, nearPostalCodesPromise]).then((values) => {
      weatherData = (values[0].status === "fulfilled" ? values[0].value.data.daily.slice(0, 3) : null)
      nearPostalCodes = (values[1].status === "fulfilled" ? values[1].value : null)
      if (nearPostalCodes) {
        mainPostalCode = nearPostalCodes.find(code => code.postal_code === postalCodeString)
      } else {
        // LOAD mainPostalCode from PostCodeData
      }
      res.render('postal_code', {
        weatherData: weatherData,
        nearPostalCodes: nearPostalCodes,
        mainPostalCode: mainPostalCode,
        searchedPostalCode: postalCodeString,
        location: {
          lat: lat,
          lon: lon
        }
      })
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
