# Use Bash shell.
# NOTE: You can control which Bash version is used by setting the PATH
# appropriately.
SHELL := bash

# Path to the directory of this Makefile.
# NOTE: Prepend all relative paths in this Makefile with this variable to ensure
# they are properly resolved when this Makefile is included from Makefiles in
# other directories.
SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

# Function for comparing two strings for equality.
# NOTE: This will also return false if both strings are empty.
eq = $(and $(findstring $(1),$(2)), $(findstring $(2),$(1)))

# Check if we're running in an interactive terminal.
ISATTY := $(shell [ -t 0 ] && echo 1)

# If running interactively, use terminal colors.
ifdef ISATTY
	MAGENTA := \e[35;1m
	CYAN := \e[36;1m
	RED := \e[0;31m
	OFF := \e[0m
	ECHO_CMD := echo -e
else
	MAGENTA := ""
	CYAN := ""
	RED := ""
	OFF := ""
	ECHO_CMD := echo
endif

# Output messages to stderr instead stdout.
ECHO := $(ECHO_CMD) 1>&2

# Name of git remote pointing to the canonical upstream git repository, i.e.
# git@github.com:oasisprotocol/<repo-name>.git.
GIT_ORIGIN_REMOTE ?= origin

# Name of the branch where to tag the next release.
RELEASE_BRANCH ?= master

# Helper that checks commits with gitlilnt.
# NOTE: gitlint internally uses git rev-list, where A..B is asymmetric
# difference, which is kind of the opposite of how git diff interprets
# A..B vs A...B.
define CHECK_GITLINT =
	BRANCH=$(GIT_ORIGIN_REMOTE)/$(RELEASE_BRANCH); \
	COMMIT_SHA=`git rev-parse $$BRANCH` && \
	$(ECHO) "$(CYAN)*** Running gitlint for commits from $$BRANCH ($${COMMIT_SHA:0:7})... $(OFF)"; \
	gitlint --commits $$BRANCH..HEAD
endef
