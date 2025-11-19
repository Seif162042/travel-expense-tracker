module.exports = {
    testEnvironment: 'jsdom',
    transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        // Match ALL possible ways axios can be imported:
        // 1. From same directory (./axios) - CRITICAL for participants.js
        '^\\./axios$': '<rootDir>/mocks/src/api/axios.jsx',
        '^\\./axios\\.jsx$': '<rootDir>/mocks/src/api/axios.jsx',
        // 2. From parent directory (../api/axios)
        '^\\.\\./api/axios$': '<rootDir>/mocks/src/api/axios.jsx',
        '^\\.\\./api/axios\\.jsx$': '<rootDir>/mocks/src/api/axios.jsx',
        // 3. From grandparent directory (../../api/axios)
        '^\\.\\./\\.\\./api/axios$': '<rootDir>/mocks/src/api/axios.jsx',
        '^\\.\\./\\.\\./api/axios\\.jsx$': '<rootDir>/mocks/src/api/axios.jsx',
        // 4. Any other paths containing api/axios
        'api/axios': '<rootDir>/mocks/src/api/axios.jsx',
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};
