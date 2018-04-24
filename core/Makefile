NODETESTS ?= test/unit/*.js

test-node:
	@NODE_ENV=test NODE_TLS_REJECT_UNAUTHORIZED=0 ./node_modules/.bin/mocha \
		--reporter doc $(NODETESTS) | cat docs/head.html - docs/foot.html > docs/index.html

.PHONY: test-docs