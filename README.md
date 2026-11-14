# Sincerely website concept

A design concept for a new Sincerely website (the live site is https://sincerelyinc.com).
Static HTML, CSS and a little JavaScript, served as-is: there is no build step on the server.

This is a preview for review only. Forms do not send or store anything, and the pages ask
search engines not to index them. Words, photographs and artwork belong to Sincerely Inc.
and Katherine Dudtschak.

## What is here

- `index.html` and the other top-level pages: home, Experience, The Sincerely Show, Sincerely
  Letters, the memoir, the Library, Sincerely Human, Work with Sincerely, Speaking, the
  Foundation and Katherine.
- `show-*.html`: one page per conversation, with the video, the Spotify player, the show
  notes and the written story.
- `letter-*.html`: one page per letter.
- `assets/`: one stylesheet, one script, the images, and `search.json`, the text of every
  conversation and letter, which the Library's search reads the first time someone types.

The pages are generated from templates and data kept outside this repository.
