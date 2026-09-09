#!/usr/bin/env bash
set -Eeuo pipefail

main() {
  local root config state revision repository origin base image old_image container tmp deadline status
  root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
  cd "$root"
  config="${DEPLOY_CONFIG:-/etc/personal-website/deploy.env}"
  if [[ -f "$config" ]]; then set -a; source "$config"; set +a; fi
  state="${STATE_DIR:-/var/lib/personal-website}"
  mkdir -p "$state"
  chmod 700 "$state"
  if [[ "${1:-}" != '--apply' ]]; then
    exec 9>"$state/deploy.lock"
    flock -n 9 || { echo 'Another deployment is running.' >&2; exit 1; }
    [[ -z "$(git status --porcelain)" ]] || { echo 'Checkout is dirty; commit or back up changes before deployment.' >&2; exit 1; }
    git pull --ff-only
    # Execute the script from the newly pulled commit; retain the deployment lock.
    exec bash "$root/scripts/deploy.sh" --apply
  fi
  [[ -e /proc/self/fd/9 ]] || { echo 'Run without internal --apply argument.' >&2; exit 1; }
  [[ -z "$(git status --porcelain)" ]] || { echo 'Checkout changed during pull.' >&2; exit 1; }
  revision="$(git rev-parse HEAD)"
  origin="$(git remote get-url origin)"
  case "$origin" in
    git@github.com:*) repository="${origin#git@github.com:}" ;;
    https://github.com/*) repository="${origin#https://github.com/}" ;;
    *) repository="${RELEASE_REPOSITORY:?Set RELEASE_REPOSITORY=OWNER/REPO in external config}" ;;
  esac
  repository="${RELEASE_REPOSITORY:-${repository%.git}}"
  [[ "$repository" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { echo 'Invalid release repository.' >&2; exit 1; }
  image="jcl-portfolio:$revision"
  export APP_IMAGE="$image"
  docker network inspect "${INGRESS_NETWORK:-jcl-ingress}" >/dev/null
  tmp="$(mktemp -d "$state/download.XXXXXX")"
  DEPLOY_TMP="$tmp"
  trap 'rm -f -- "$DEPLOY_TMP/website-image.tar.gz" "$DEPLOY_TMP/website-image.tar.gz.sha256"; rmdir -- "$DEPLOY_TMP" 2>/dev/null || true' EXIT
  if ! docker image inspect "$image" >/dev/null 2>&1; then
    base="https://github.com/$repository/releases/download/deploy-$revision"
    deadline=$((SECONDS + 900))
    echo "Waiting for the GitHub build of ${revision:0:12} (up to 15 minutes)..."
    while ! curl --fail --silent --show-error --location --connect-timeout 10 --max-time 30 "$base/website-image.tar.gz.sha256" -o "$tmp/website-image.tar.gz.sha256"; do
      (( SECONDS < deadline )) || { echo 'Release is not ready. Check GitHub Actions; the running site is unchanged.' >&2; exit 1; }
      sleep 15
    done
    curl --fail --show-error --location --retry 3 --connect-timeout 15 --max-time 600 "$base/website-image.tar.gz" -o "$tmp/website-image.tar.gz"
    # Accept exactly one checksum for the expected basename, never arbitrary paths.
    grep -Eq '^[a-f0-9]{64}  website-image\.tar\.gz$' "$tmp/website-image.tar.gz.sha256"
    [[ "$(wc -l < "$tmp/website-image.tar.gz.sha256")" -eq 1 ]]
    (cd "$tmp" && sha256sum --check website-image.tar.gz.sha256)
    docker load -i "$tmp/website-image.tar.gz"
  fi
  [[ "$(docker image inspect "$image" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')" == "$revision" ]] || { echo 'Image revision does not match checkout.' >&2; exit 1; }
  container="$(docker compose ps -q web)"
  old_image=''
  if [[ -n "$container" ]]; then old_image="$(docker inspect "$container" --format '{{.Config.Image}}')"; fi
  echo "Deploying ${revision:0:12}..."
  if ! docker compose up -d --no-build --wait --wait-timeout 120 web; then
    echo 'Health check failed.' >&2
    docker compose logs --tail=40 web >&2
    if [[ -n "$old_image" ]]; then
      echo 'Restoring the previous image...' >&2
      APP_IMAGE="$old_image" docker compose up -d --no-build --wait --wait-timeout 120 web
    fi
    exit 1
  fi
  printf '%s\n' "$revision" > "$state/current-revision"
  printf '%s\n' "$image" > "$state/current-image"
  echo "Deployment healthy: ${revision:0:12}. Git checkout remains clean; the shared gateway was not changed."
}
main "$@"
