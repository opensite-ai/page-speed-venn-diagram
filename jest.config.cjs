module.exports = {
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	moduleNameMapper: {
		"^@upsetjs/venn\\.js$": "<rootDir>/tests/__mocks__/vennMock.ts",
		"^.+\\.module\\.css$": "<rootDir>/tests/__mocks__/styleMock.ts",
	},
};

