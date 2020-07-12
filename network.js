var axios = require('axios');

network = {
    fetchPostcodeData: (postalCode) => {
        noHyphenPostalCode = postalCode.split('-').join('')
        url = 'https://apis.postcode-jp.com/api/v3/postcodes/' + noHyphenPostalCode
        return axios.get(url, {
            headers: {
                "apikey": "GVgQlNR36mSJGxUwe96756DEb2VXRZ0Sncd4ZD3"
            },
        })
    },
    fetchWeatherData: (lat, lon) => {
        appid = '4b91afdb742d3a52e4363b6731ef7708'
        return axios.get('https://api.openweathermap.org/data/2.5/onecall', {
            params: {
                lat: lat,
                lon: lon,
                units: 'metric',
                appid: '4b91afdb742d3a52e4363b6731ef7708'
            },
        })
    }
}

module.exports = network;
