module.exports = {
    testEnvironment: 'jsdom',
    transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^../api/axios$': '<rootDir>/mocks/src/api/axios.jsx'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};
