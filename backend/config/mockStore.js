// Centralized In-Memory Store for Mock / Fallback Mode (When MongoDB is offline)

const inMemoryUsers = [
  {
    _id: 'usr_mock_201',
    id: 'usr_mock_201',
    name: 'Priya Sharma',
    email: 'priya@test.com',
    skillsToTeach: ['System Design', 'React'],
    skillsToLearn: ['Python'],
    rating: 4.9,
    totalReviews: 8,
    skillCredits: 20
  },
  {
    _id: 'usr_mock_202',
    id: 'usr_mock_202',
    name: 'Alex Chen',
    email: 'alex@test.com',
    skillsToTeach: ['Python', 'Data Science'],
    skillsToLearn: ['Node.js'],
    rating: 5.0,
    totalReviews: 12,
    skillCredits: 15
  },
  {
    _id: 'usr_mock_203',
    id: 'usr_mock_203',
    name: 'Ashmak Madhart',
    email: 'ashmak@test.com',
    skillsToTeach: ['Node.js', 'MongoDB'],
    skillsToLearn: ['Go'],
    rating: 4.8,
    totalReviews: 5,
    skillCredits: 25
  }
];

const inMemorySessions = [];

module.exports = {
  inMemoryUsers,
  inMemorySessions
};
