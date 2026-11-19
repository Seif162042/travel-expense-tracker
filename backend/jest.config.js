export default {
    testEnvironment: "node",
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    transform: {},
    collectCoverageFrom: ["src/**/*.js"],
    coverageReporters: ["text", "text-summary"],
};
