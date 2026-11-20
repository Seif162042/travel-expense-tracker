export default {
    testEnvironment: "node",
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    transform: {},
    setupFiles: ["<rootDir>/tests/setupEnv.js"],
    collectCoverageFrom: ["src/**/*.js"],
    coverageReporters: ["text", "text-summary"],
};
