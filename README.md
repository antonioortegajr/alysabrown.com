# alysabrown.com

Portfolio site for Alysa Brown, a fine artist in Eugene, Oregon. Live at [alysabrown.com](https://alysabrown.com).

A single static page: all markup and CSS are in `index.html`, and artwork images are in `assets/` in several sizes, each as JPG and webp. There's no build step and no JavaScript.

## Run locally

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Workflow

- Branch from `staging` and open a PR against `staging`. `main` is production.
- GitHub Pages deploys `main` automatically.
- Lighthouse CI runs on every PR to `staging` and on the live site after each deploy. See the Actions tab.

Contributor and agent guidelines (conventions, adding artwork, image sizes) are in [AGENTS.md](AGENTS.md).
