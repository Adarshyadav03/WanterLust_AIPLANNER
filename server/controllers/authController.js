const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { getFallbackStatus } = require('../config/db');

const memoryUsers = [
  {
    _id: '65f8a09b1234567890abcde1',
    name: 'Rohan Mehta',
    email: 'rohan@example.com',
    role: 'user',
    location: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Avid mountain trekker looking for travel buddies to explore Himachal Pradesh.',
    travelStyle: 'Adventure',
    budget: '₹20,000',
    destination: 'Manali',
  },
  {
    _id: '65f8a09b1234567890abcde2',
    name: 'Ananya Roy',
    email: 'ananya@example.com',
    role: 'user',
    location: 'Kolkata',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Beach lover planning a weekend trip to North & South Goa shacks.',
    travelStyle: 'Relaxed',
    budget: '₹18,000',
    destination: 'Goa',
  },
  {
    _id: '65f8a09b1234567890abcde3',
    name: 'Karan Kapoor',
    email: 'karan@example.com',
    role: 'user',
    location: 'Delhi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'History buff exploring Jaipur forts and Udaipur royal lakes.',
    travelStyle: 'Heritage',
    budget: '₹25,000',
    destination: 'Rajasthan',
  },
  {
    _id: '65f8a09b1234567890abcde4',
    name: 'Pooja Hegde',
    email: 'pooja@example.com',
    role: 'user',
    location: 'Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Nature enthusiast seeking group members for Munnar & Alleppey trip.',
    travelStyle: 'Nature',
    budget: '₹22,000',
    destination: 'Kerala',
  },
];

const generateToken = (id, role, name, email, avatar) => {
  return jwt.sign(
    { id, role, name, email, avatar },
    process.env.JWT_SECRET || 'wanderlust_super_secret_jwt_key_2026_mca_project',
    { expiresIn: '30d' }
  );
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (getFallbackStatus()) {
    const existing = memoryUsers.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = {
      _id: '65f8a09b12345678' + Math.floor(10000000 + Math.random() * 90000000).toString(16),
      name,
      email: email.toLowerCase(),
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      authProvider: 'local',
    };
    memoryUsers.push(newUser);
    const token = generateToken(newUser._id, newUser.role, newUser.name, newUser.email, newUser.avatar);
    return res.status(201).json({ user: newUser, token });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      authProvider: 'local',
    });

    const token = generateToken(user._id, user.role, user.name, user.email, user.avatar);
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        authProvider: user.authProvider,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const cleanEmail = email.toLowerCase();

  // Admin Quick Login Override
  if (cleanEmail === 'admin@wanderlust.com' && (password === 'admin123' || password === 'Test@123')) {
    const adminUser = {
      _id: '65f8a09b1234567890abcdef',
      name: 'WanderLust Admin',
      email: 'admin@wanderlust.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    };
    const token = generateToken(adminUser._id, adminUser.role, adminUser.name, adminUser.email, adminUser.avatar);
    return res.json({ user: adminUser, token });
  }

  // Demo 3-Account Login Overrides
  const matchedDemo = memoryUsers.find((u) => u.email === cleanEmail);
  if (matchedDemo) {
    const token = generateToken(matchedDemo._id, matchedDemo.role, matchedDemo.name, matchedDemo.email, matchedDemo.avatar);
    return res.json({ user: matchedDemo, token });
  }

  if (getFallbackStatus()) {
    const guestUser = {
      _id: '65f8a09b1234567890abcde0',
      name: 'Demo Traveler',
      email: cleanEmail,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };
    const token = generateToken(guestUser._id, guestUser.role, guestUser.name, guestUser.email, guestUser.avatar);
    return res.json({ user: guestUser, token });
  }

  try {
    const user = await User.findOne({ email: cleanEmail });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role, user.name, user.email, user.avatar);
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          authProvider: user.authProvider,
        },
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== GOOGLE OAUTH CONTROLLERS =====================
const googleAuth = (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!googleClientId) {
    // Demo fallback for testing without Google API Client ID
    const demoUser = memoryUsers[1] || memoryUsers[0];
    const token = generateToken(demoUser._id, demoUser.role, demoUser.name, demoUser.email, demoUser.avatar);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

  res.redirect(googleAuthUrl);
};

const googleCallback = async (req, res) => {
  const { code } = req.query;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code || !googleClientId || !googleClientSecret) {
    const demoUser = memoryUsers[1] || memoryUsers[0];
    const token = generateToken(demoUser._id, demoUser.role, demoUser.name, demoUser.email, demoUser.avatar);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: googleClientId,
      client_secret: googleClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: callbackUrl,
    });

    const { access_token } = tokenRes.data;

    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name, picture } = profileRes.data;
    const cleanEmail = email.toLowerCase();

    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }],
    });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (user.authProvider === 'local') user.authProvider = 'google';
      if (!user.avatar || user.avatar.includes('unsplash')) user.avatar = picture || user.avatar;
      await user.save();
    } else {
      user = await User.create({
        name: name || 'Google Traveler',
        email: cleanEmail,
        avatar: picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        googleId,
        authProvider: 'google',
      });
    }

    const token = generateToken(user._id, user.role, user.name, user.email, user.avatar);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error?.response?.data || error.message);
    res.redirect(`${frontendUrl}/login?error=google_oauth_failed`);
  }
};

// ===================== GITHUB OAUTH CONTROLLERS =====================
const githubAuth = (req, res) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!githubClientId) {
    const demoGithubUser = memoryUsers[2] || memoryUsers[0];
    const token = generateToken(demoGithubUser._id, demoGithubUser.role, demoGithubUser.name, demoGithubUser.email, demoGithubUser.avatar);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=user:email`;

  res.redirect(githubAuthUrl);
};

const githubCallback = async (req, res) => {
  const { code } = req.query;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code || !githubClientId || !githubClientSecret) {
    const demoUser = memoryUsers[2] || memoryUsers[0];
    const token = generateToken(demoUser._id, demoUser.role, demoUser.name, demoUser.email, demoUser.avatar);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenRes.data;

    const profileRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });

    let email = profileRes.data.email;
    if (!email) {
      const emailRes = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${access_token}` },
      });
      const primaryObj = emailRes.data.find((e) => e.primary && e.verified) || emailRes.data[0];
      email = primaryObj ? primaryObj.email : `${profileRes.data.login}@github.com`;
    }

    const cleanEmail = email.toLowerCase();
    const githubId = profileRes.data.id.toString();

    let user = await User.findOne({
      $or: [{ githubId }, { email: cleanEmail }],
    });

    if (user) {
      if (!user.githubId) user.githubId = githubId;
      if (user.authProvider === 'local') user.authProvider = 'github';
      await user.save();
    } else {
      user = await User.create({
        name: profileRes.data.name || profileRes.data.login || 'GitHub Traveler',
        email: cleanEmail,
        avatar: profileRes.data.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        githubId,
        authProvider: 'github',
      });
    }

    const token = generateToken(user._id, user.role, user.name, user.email, user.avatar);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error?.response?.data || error.message);
    res.redirect(`${frontendUrl}/login?error=github_oauth_failed`);
  }
};

const getMe = async (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Successfully logged out' });
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  getMe,
  logoutUser,
  memoryUsers,
};
