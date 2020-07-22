FROM node:14

# nice clean home for our action files
RUN mkdir /action
WORKDIR /action

# Install semantic release with plugins
RUN npm install -g @actions/core semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/exec  @semantic-release/github @semantic-release/release-notes-generator

# copy in entrypoint after dependency installation
COPY entrypoint.js .

ENTRYPOINT ["node", "/action/entrypoint.js"]
