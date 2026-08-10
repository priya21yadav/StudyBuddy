const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const dummyMentors = [
  {
    name: 'Priya Sharma',
    email: 'priya@test.com',
    password: 'password123',
    role: 'mentor',
    skillsToTeach: ['System Design', 'React', 'TypeScript'],
    skillsToLearn: ['Python', 'Docker'],
    isVerifiedMentor: true,
    rating: 4.9,
    skillCredits: 20,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    name: 'Alex Chen',
    email: 'alex@test.com',
    password: 'password123',
    role: 'mentor',
    skillsToTeach: ['Python', 'Data Science', 'Machine Learning'],
    skillsToLearn: ['Node.js'],
    isVerifiedMentor: true,
    rating: 5.0,
    skillCredits: 15,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    name: 'Ashmak Madhart',
    email: 'ashmak@test.com',
    password: 'password123',
    role: 'mentor',
    skillsToTeach: ['System Design', 'Node.js', 'MongoDB'],
    skillsToLearn: ['Go', 'Kubernetes'],
    isVerifiedMentor: true,
    rating: 4.8,
    skillCredits: 25,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
];

const seedData = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studybuddy';
    await mongoose.connect(connUri);

    // Delete previous test seed users if any
    await User.deleteMany({ email: { $in: ['priya@test.com', 'alex@test.com', 'ashmak@test.com'] } });

    const salt = await bcrypt.genSalt(10);
    const hashedMentors = await Promise.all(
      dummyMentors.map(async (m) => ({
        ...m,
        password: await bcrypt.hash(m.password, salt),
      }))
    );

    await User.insertMany(hashedMentors);

    console.log('✅ Sample Mentors Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();