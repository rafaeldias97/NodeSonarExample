# NodeJs + Express + Docker + Jest + Sonarqube
In this article, we talk about a basic example using Nodejs, Express, Docker, Jest and Sonarqube.
Using the wikipedia explanation **"SonarQube is an open source platform developed by SonarSource for continuous code quality inspection, to perform automatic reviews with static code analysis to detect bugs, code odors and security vulnerabilities in over 20 languages. programming."**
For this tutorial, we'll need:
 - [Node/npm](https://nodejs.org/en/)
 - [Docker](https://www.docker.com/get-started) 

With node and docker installed, let's start the project
## Starting the project
 Creating project folder and browsing
> mkdir NodeSonarExample
> cd ./NodeSonarExample

Starting the project
> npm init -y

## Installing dependencies
In this session, we will install the dependencies and development dependencies for the project.

 1. **Express** which allows http requests, widely used in MVC and Restfull applications.
 2. **Jest** is used to perform unit testing.

> npm install --save express jest

 1. **sonarqube-scanner** is necessary to scan JS code very simply, without needing to install any specific tool or (Java) runtime.
 2. **jest-sonar-reporter** is a custom results processor for Jest. The processor converts Jest's output into Sonar's [generic test data](https://docs.sonarqube.org/display/SONAR/Generic+Test+Data) format.
 3. **supertest** we can test http requests for express routes

> npm install -D sonarqube-scanner jest-sonar-reporter supertest

## Docker Image SonarQube
Let's start sonarqube by creating the **docker-compose.sonar.yml** file.
```yml
version:  '3'
services:
	sonarqube:
		container_name:  sonarqube
		image:  sonarqube:latest
		ports:
			-  "9000:9000"
			-  "9092:9092"
```  
and execute the file with the command:
> docker-compose -f docker-compose.sonar.yml up -d

With sonarqube running, navigate to [sonarqube address](http://localhost:9000/sessions/new) and authenticate using the default account
**login**: admin 
**password**: admin
Authenticated, you will notice that there is no project pipeline created as shown in the image below
![Project void](![ProjectVoid.PNG](https://github.com/rafaeldias97/NodeSonarExample/blob/master/images/ProjectVoid.PNG?raw=true))

## Simple project example
In this session, I will show the project structure, and all the code involved

### Project structure
![Project Structure](https://github.com/rafaeldias97/NodeSonarExample/blob/master/images/ProjectStructure.PNG?raw=true)

### Code
**file**: src/index.js
```javascript
const express =  require('express');
const app =  express();
const port =  process.env.PORT  ||  8080

// Route to be tested
app.get('/', (req, res) => {
	return res.status(200).json({ nome:  'Rafael Dias' });
});

// Application running on the door
let server = app.listen(port, () => {
	console.log(`Application running on ${port}`);
});

module.exports  = server;
```

**file**: sonar-project.js
```javascript
const sonarqubeScanner =  require('sonarqube-scanner');
sonarqubeScanner(
	{
		serverUrl:  'http://localhost:9000',
		options : {
			'sonar.sources':  'src',
			'sonar.tests':  'src',
			'sonar.inclusions'  :  '**', // Entry point of your code
			'sonar.test.inclusions':  'src/**/*.spec.js,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx',
			'sonar.javascript.lcov.reportPaths':  'coverage/lcov.info',
			'sonar.testExecutionReportPaths':  'coverage/test-reporter.xml'
		}
	}, () => {});
	
module.exports  = server;
```
Include these lines in your package.json file

**file**: package.json
```JSON
{
	.
	.
	.
	"scripts": {
		"sonar":  "node sonar-project.js",
		"test":  "jest --coverage"
	},
	"jest": {
		"testEnvironment":  "node",
		"coveragePathIgnorePatterns": [
			"/node_modules/"
		],
		"testResultsProcessor":  "jest-sonar-reporter"
	},
	"jestSonar": {
		"reportPath":  "coverage",
		"reportFile":  "test-reporter.xml",
		"indent":  4
	}
	.
	.
	.
}
```
With the project created, just run 
>node src/index.js

With the project running, open the browser and navigate to http://localhost:8080/
the expected return is 
```JSON
{ name: 'Rafael Dias' }
```
Now let's go to automated testing to perform sonarqube test coverage

### Automated test
let's create a test file. So we will import the index.js file and supertest to get the get request for route '/'.
In the end it is necessary to close the open server connection for the test to be terminated

**file**: src/test/index.test.js
```javascript
const request =  require('supertest')
const server =  require('../index')

describe('Get Endpoints', () => {
	it('Get', async (done) => {
		const res =  await  request(server)
		.get('/')
		.send({
			userId:  1,
			title:  'test is cool',
		});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty('nome');
		done();
	})
})
afterAll(async  done  => {
	// close server conection
	server.close();
	done();
});
```
To perform the tests, it is necessary to execute the command
> npm run test

The test results should be successful as in the image below:
![Test Result](https://github.com/rafaeldias97/NodeSonarExample/blob/master/images/TestResult.PNG?raw=true)

After all tests are successfully executed, a folder named "**coverage**" will be generated.
![Coverage Folder](https://github.com/rafaeldias97/NodeSonarExample/blob/master/images/CoverageFolder.PNG?raw=true)

**Coverage** folder files are being referenced in **sonar-project.js**
finally, the command must be executed
> npm run sonar

This command is responsible for executing the pipeline and committing SonarQube
As a result, you have 100% of your code covered per test, by default you need at least 80%
![Sonar Result](https://github.com/rafaeldias97/NodeSonarExample/blob/master/images/SonarResult.PNG?raw=true)