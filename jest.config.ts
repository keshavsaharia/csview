export default {
	clearMocks: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: [
		'./src'
	],
	testMatch: [
		'**/*.test.ts'
	],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{tsconfig: './tsconfig.json'},
		],
	},
	collectCoverage: true,
	coverageReporters: ["json", "html"]
}
