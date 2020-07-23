FROM node:12

# Install semantic release with plugins
RUN npm install -g @actions/core @actions/github
RUN npm install semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/exec  @semantic-release/github @semantic-release/release-notes-generator

# copy in entrypoint after dependency installation
COPY entrypoint.js .

ENTRYPOINT ["node", "entrypoint.js"]
