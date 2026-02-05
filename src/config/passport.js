const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const env = require('./env');

// Only configure Google OAuth if credentials are provided
const isGoogleConfigured = env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    !env.GOOGLE_CLIENT_ID.includes('your-google');

if (isGoogleConfigured) {
    passport.use(new GoogleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Extract email from profile
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

            if (!email) {
                return done(new Error('No email found in Google profile'), null);
            }

            // Check if user exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // User exists with this Google ID - return user
                return done(null, user);
            }

            // Check if user exists with this email (may have signed up with email/password)
            user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                if (!user.profilePicture && profile.photos && profile.photos[0]) {
                    user.profilePicture = profile.photos[0].value;
                }
                user.isEmailVerified = true; // Google confirms email
                await user.save();
                return done(null, user);
            }

            // Create new user from Google profile
            const newUser = await User.create({
                googleId: profile.id,
                email: email.toLowerCase(),
                username: generateUsername(profile.displayName, email),
                fullname: profile.displayName || 'Google User',
                profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
                isEmailVerified: true // Google confirms email
            });

            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    }));

    console.log('✅ Google OAuth configured');
} else {
    console.log('⚠️  Google OAuth not configured (missing credentials)');
}

/**
 * Generate a unique username from display name or email
 * @param {string} displayName 
 * @param {string} email 
 * @returns {string} Unique username
 */
function generateUsername(displayName, email) {
    // Try to create username from display name
    let baseUsername = displayName
        ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
        : email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // Ensure minimum length
    if (baseUsername.length < 3) {
        baseUsername = 'user' + baseUsername;
    }

    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${baseUsername}${randomSuffix}`.substring(0, 30);
}

// Serialize user for session (if using sessions)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
