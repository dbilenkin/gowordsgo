var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var FB = require('fb');

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
    	
      function getPicture() {
      	
      	//FB.setAccessToken(accessToken);
		
		FB.api('/me/picture', {redirect: false, access_token: accessToken}, function(response) {
			saveUser(response.data.url);
		});
      }
      
      function saveUser(picture) {
      	user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json,
            picture: picture
          });
          user.save(function(err) {
            if (err) done(err);
            return done(err, user);
          });
      }
      
      User.findOne({
        'facebook.id': profile.id
      },
      function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          getPicture();
        } else {
          return done(err, user);
        }
      });
    }
  ));
};