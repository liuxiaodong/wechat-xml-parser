TESTS = test/**.test.js
REPORTER = spec
TIMEOUT = 2000
ISTANBUL = ./node_modules/.bin/istanbul
MOCHA = ./node_modules/.bin/_mocha
COVERALLS = ./node_modules/.bin/coveralls

test:
	@NODE_ENV=test $(MOCHA) -R $(REPORTER) -t $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

test-cov:
	@$(ISTANBUL) cover --report html $(MOCHA) -- -t $(TIMEOUT) -R spec $(TESTS)

test-coveralls:
	@$(ISTANBUL) cover --report lcovonly $(MOCHA) -- -t $(TIMEOUT) -R spec $(TESTS)
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@cat ./coverage/lcov.info | $(COVERALLS) && rm -rf ./coverage

test-all: test test-coveralls

clean:
	rm -rf coverage

.PHONY: test