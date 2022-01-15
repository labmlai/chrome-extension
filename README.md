# [papers.labml.ai](https://papers.labml.ai) Chrome extension

This is the source code of the papers.labml.ai Chrome extension.

## [Get it from Chrome webstore]()

## About

🔎  View information about research papers linked from websites you visit.

This extension shows you the following details about research papers:
✨ 2-line summary
✨ Availability source code, videos, and discussions
✨ Popularity on Twitter
✨ Conferences

When you visit a website or a web app the extension icon (flask icon) in the browser will show a small badge that indicates the number of research papers found on that website. Click the extension icon to see the list of papers with summaries and other information. You can click on a paper to see the full details.

Optionally, the extension can also add an icon (📎) next to the links to research papers. You can click this icon to get the paper summary and other information.

This works on any website; for example, Google search, Twitter, blogs, tutorials, forums.

### How it works

This extension will extract the links to research papers from the websites you visit and send them to labml.ai servers to retrieve papers summaries. We need permission to "Allow this extension to read and change all your data on websites you visit: on all sites" to do this.

We have made the source code of this extension public for better transparency (and if anyone in the community wants to help us improve it 😊).

Github: [https://github.com/labmlai/chrome-extension](https://github.com/labmlai/chrome-extension)

## Building the extension locally

1. Add [weya](https://github.com/vpj/weya) to `./lib`
2. Run `npm install`
3. Run `npm run build`
