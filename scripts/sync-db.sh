#!/bin/bash
#
# Copies the latest schema.prisma into every app folder under /var/www and runs
# "prisma db push" there, so each app's database (DATABASE_URL in its own .env)
# gets the new tables / columns.
#
# Usage (on the VPS):
#   1. Put the new schema next to deploy.zip:   /var/www/schema.prisma
#   2. Preview first:   bash sync-db.sh --dry-run
#   3. Run it:          bash sync-db.sh
#
# Options:
#   --dry-run    only show what would change in each database, change nothing
#   --generate   also run "prisma generate" in each folder (not needed when the
#                deployed build already contains the generated client)
#   --schema F   use schema file F instead of /var/www/schema.prisma
#
# Safety: "db push" refuses changes that would delete data (dropped columns or
# tables, type changes). Such a folder is reported as FAILED and its database
# is left untouched; the other folders still run.

set -Euo pipefail

BASE_DIR="${BASE_DIR:-/var/www}"   # override only for testing
SCHEMA_FILE="$BASE_DIR/schema.prisma"
PRISMA_VERSION="6.12.0"   # same version as the app (package.json)
DRY_RUN=false
GENERATE=false

# Same folders the deploy script skips
EXCLUDED_DIRS=(
    "fatehpur.inventory"
    "html"
    "spycore.in"
)

while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run)  DRY_RUN=true ;;
        --generate) GENERATE=true ;;
        --schema)   SCHEMA_FILE="${2:?--schema needs a file}"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

if [[ ! -f "$SCHEMA_FILE" ]]; then
    echo "ERROR: schema not found at $SCHEMA_FILE"
    echo "Copy prisma/schema.prisma from the project to $SCHEMA_FILE first."
    exit 1
fi

echo "========================================"
echo "Schema:  $SCHEMA_FILE"
echo "Mode:    $([[ $DRY_RUN == true ]] && echo 'DRY RUN (no changes)' || echo 'APPLY')"
echo "========================================"

SUCCEEDED=()
FAILED=()
SKIPPED=()

for DIR in "$BASE_DIR"/*/; do
    [[ -d "$DIR" ]] || continue
    DIR="${DIR%/}"
    FOLDER_NAME=$(basename "$DIR")

    SKIP=false
    for EXCLUDED in "${EXCLUDED_DIRS[@]}"; do
        [[ "$FOLDER_NAME" == "$EXCLUDED" ]] && SKIP=true && break
    done
    if [[ "$SKIP" == true ]]; then
        echo "SKIPPING: $FOLDER_NAME (excluded)"
        SKIPPED+=("$FOLDER_NAME")
        continue
    fi

    # Only real app folders: they need a .env with DATABASE_URL
    if [[ ! -f "$DIR/.env" ]] || ! grep -qE '^\s*DATABASE_URL=' "$DIR/.env"; then
        echo "SKIPPING: $FOLDER_NAME (no .env with DATABASE_URL)"
        SKIPPED+=("$FOLDER_NAME")
        continue
    fi

    echo ""
    echo "----------------------------------------"
    echo "Syncing: $FOLDER_NAME"
    echo "----------------------------------------"

    # Use the app's own Prisma CLI if installed; otherwise the pinned version
    # (never "latest" — a newer major version would not read this schema).
    if [[ -x "$DIR/node_modules/.bin/prisma" ]]; then
        PRISMA=("$DIR/node_modules/.bin/prisma")
    else
        PRISMA=(npx --yes "prisma@$PRISMA_VERSION")
    fi

    if [[ "$DRY_RUN" == true ]]; then
        # Shows the SQL that "db push" would run against this folder's database
        if (cd "$DIR" && set -a && source ./.env && set +a && \
            "${PRISMA[@]}" migrate diff \
                --from-url "$DATABASE_URL" \
                --to-schema-datamodel "$SCHEMA_FILE" \
                --script); then
            SUCCEEDED+=("$FOLDER_NAME")
        else
            echo "FAILED: could not compare $FOLDER_NAME"
            FAILED+=("$FOLDER_NAME")
        fi
        continue
    fi

    # Copy the schema (keep the previous one as a backup)
    mkdir -p "$DIR/prisma"
    if [[ -f "$DIR/prisma/schema.prisma" ]]; then
        cp -f "$DIR/prisma/schema.prisma" "$DIR/prisma/schema.prisma.bak"
    fi
    cp -f "$SCHEMA_FILE" "$DIR/prisma/schema.prisma"

    PUSH_ARGS=(db push --schema prisma/schema.prisma)
    [[ "$GENERATE" == true ]] || PUSH_ARGS+=(--skip-generate)

    # Prisma reads DATABASE_URL from the .env in the folder it runs in
    if (cd "$DIR" && "${PRISMA[@]}" "${PUSH_ARGS[@]}"); then
        echo "SUCCESS: $FOLDER_NAME database is in sync"
        SUCCEEDED+=("$FOLDER_NAME")
    else
        echo "FAILED: $FOLDER_NAME (database not changed — see the message above)"
        FAILED+=("$FOLDER_NAME")
    fi
done

echo ""
echo "========================================"
echo "Summary"
echo "========================================"
echo "Done:    ${#SUCCEEDED[@]}  ${SUCCEEDED[*]:-}"
echo "Failed:  ${#FAILED[@]}  ${FAILED[*]:-}"
echo "Skipped: ${#SKIPPED[@]}  ${SKIPPED[*]:-}"

if [[ ${#FAILED[@]} -gt 0 ]]; then
    exit 1
fi

if [[ "$DRY_RUN" == false && "$GENERATE" == true ]]; then
    echo ""
    echo "Restarting all PM2 applications (new Prisma client)..."
    pm2 restart all
fi
