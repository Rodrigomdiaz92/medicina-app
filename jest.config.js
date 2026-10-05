module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-slots/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};