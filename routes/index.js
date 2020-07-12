var express = require('express');
var router = express.Router();
var network = require('../network')

postalCodeRegex = /\d\d\d-\d\d\d\d/
postalCodeLength = 8
sqlNearPostalCodes = "SELECT near_codes.* FROM postal_codes as near_codes, (SELECT id FROM postal_codes WHERE postal_code = ?) as main_code WHERE near_codes.id BETWEEN main_code.id-2 AND main_code.id+2;"


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
        error: `Postal Code '${postalCodeString}' is invalid.`
      })
      return
    }

    // apis.postcode-jp.com is used to find the latitude and longitude of coordiantes
    // as my coordinate source for the postal codes are inconsistent in quality.
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
      mainPostalCode = null
      if (nearPostalCodes) {
        mainPostalCode = nearPostalCodes.find(code => code.postal_code === postalCodeString)
      } else {
        // TODO: Load mainPostalCode from PostCodeData if the postal code does not exist
        // in the sql database.
        res.render('postal_code', {
          searchedPostalCode: postalCodeString,
          error: `Postal Code '${postalCodeString}' could not be found.`
        })
        return
      }

      // for (let i = 0; i < weatherData.length; i++) {
      //   weatherData
      // }



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

function formatUnixDate(unixTimestamp) {
  d = new Date(unixTimestamp*1000);
  days =['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  mm = this.getMonth() + 1; // getMonth() is zero-based
  dd = this.getDate();


  return [this.getFullYear(), (mm>9 ? '' : '0') + mm,(dd>9 ? '' : '0') + dd
         ].join('-') + ' ' + days[d.getDay()]
}

module.exports = router;
