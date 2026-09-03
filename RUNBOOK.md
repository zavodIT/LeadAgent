# LeadAgent Runbook

## Xano deployment

### Target

- Workspace: `2` (`LeadAgent`, production API canonical `leadagent-v2`)
- Source directory: `xano/`
- Credentials: existing Xano CLI profile from `profile.yaml` and `~/.xano/credentials.yaml`
- Deployment wrapper: `scripts/deploy-xano.sh`

Do not put Xano credentials, `SERPAPI_API_KEY`, or other secrets into the repository.

### Deploy all changed Xano documents

From the repository root:

```bash
npm run deploy:xano
```

The command:

1. Selects Node.js 20 when installed at `/opt/homebrew/opt/node@20/bin`.
2. Runs `npm run typecheck`.
3. Runs a Xano dry-run and prints the proposed changes.
4. Runs the real push with a second preview.
5. Waits for an explicit `y` confirmation before deployment.

Always review the preview. Do not confirm if it contains unrelated endpoints or schemas.

### Deploy one document

Paths passed after `--` are relative to `xano/`:

```bash
npm run deploy:xano -- api/leadagent/research/create_POST.xs
```

Multiple documents can be provided:

```bash
npm run deploy:xano -- \
  api/leadagent/research/create_POST.xs \
  api/leadagent/research/list_GET.xs
```

Prefer a targeted deployment when only one endpoint was changed.

### Manual equivalent

```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" \
  xano workspace push \
  --workspace 2 \
  --directory xano \
  --include 'api/leadagent/research/create_POST.xs' \
  --dry-run

PATH="/opt/homebrew/opt/node@20/bin:$PATH" \
  xano workspace push \
  --workspace 2 \
  --directory xano \
  --include 'api/leadagent/research/create_POST.xs'
```

### Verification

After deploying `POST /research`:

1. Submit a search from the frontend.
2. Open **Request history**.
3. Confirm the run status is `completed`.
4. Confirm **Search query** contains the capabilities extracted from `offer`, for example:

```text
Fintech (startup OR company) (Python OR backend)
(funding OR raises OR raised OR hiring OR launches OR expansion) when:90d
```

5. Confirm results and publication dates are visible.

### Rollback

1. Restore the previous version of the affected `.xs` file from Git.
2. Run the same targeted deployment command.
3. Review the preview and confirm the push.
4. Repeat the verification steps above.

### Troubleshooting

#### `UND_ERR_INVALID_ARG` / `invalid onError method`

Xano CLI `1.2.0` fails under Node.js 26. Use Node.js 20:

```bash
PATH="/opt/homebrew/opt/node@20/bin:$PATH" xano --version
```

The deployment wrapper applies this PATH automatically.

#### Preview contains unrelated changes

Cancel with `n` and deploy only the intended document:

```bash
npm run deploy:xano -- path/relative/to/xano/file.xs
```
