include common.mk

# Set all target as the default target.
all: build

# Build.
build:
	@$(ECHO) "$(MAGENTA)*** Building Oasis Wallet Browser Extension...$(OFF)"
	@yarn buildProd

# Lint code, commits and documentation.
lint-targets := lint-git

lint-git:
	@$(CHECK_GITLINT)

lint: $(lint-targets)

# Test.
test-targets := test-unit

test-unit:
	@$(ECHO) "$(CYAN)*** Running unit tests...$(OFF)"
	@yarn test

test: $(test-targets)

# List of targets that are not actual files.
.PHONY: \
	all build \
	$(lint-targets) lint \
	$(test-targets) test
