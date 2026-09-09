#!/bin/bash
# DeepSeek Harness Portable launcher (Linux/macOS)
cd "$(dirname "$0")" || exit 1

export DSH_HOME="$(pwd)/data/.dsh"
export DSH_AGENTS_HOME="$(pwd)/data/.agents"
QQ_ENV="$(pwd)/data/qqbot.env"

if [ ! -d "src/node_modules" ]; then
    echo "[First Run] Installing dependencies, this takes a few minutes..."
    (cd src && pnpm install --shamefully-hoist --frozen-lockfile) || {
        echo "[ERROR] Failed to install dependencies."
        echo "        Check: pnpm installed? (npm install -g pnpm) network OK?"
        exit 1
    }
    echo "[OK] Dependencies installed"
fi

set_credentials() {
    echo
    echo "========================================"
    echo "  QQ Bot credentials"
    echo "========================================"
    echo
    echo "Get them at https://q.qq.com (Bot -> Development -> Settings)"
    echo
    read -r -p "AppID: " IN_APPID
    read -r -p "AppSecret: " IN_SECRET
    if [ -z "$IN_APPID" ] || [ -z "$IN_SECRET" ]; then
        echo "[ERROR] AppID and AppSecret cannot be empty."
        return 1
    fi
    mkdir -p data
    {
        echo "QQBOT_APPID=$IN_APPID"
        echo "QQBOT_SECRET=$IN_SECRET"
    } > "$QQ_ENV"
    chmod 600 "$QQ_ENV"
    echo
    echo "[OK] Saved to data/qqbot.env"
}

start_qqbot() {
    if [ ! -f "$QQ_ENV" ]; then
        echo
        echo "[!] QQ credentials not set yet."
        read -r -p "Set them now? [Y/n]: " GO
        case "$GO" in
            n|N) return 0 ;;
            *) set_credentials || return 1 ;;
        esac
    fi

    # shellcheck disable=SC1090
    set -a
    . "$QQ_ENV"
    set +a

    if [ -z "$QQBOT_APPID" ]; then
        echo "[ERROR] data/qqbot.env is malformed. Re-enter credentials."
        set_credentials || return 1
    fi

    # Install the official Tencent plugin on first use.
    # install-qqbot.mjs uses the bundled pnpm and never pre-writes an empty
    # "dependencies" object (pnpm would say "Already up to date" and do nothing).
    if [ ! -f "data/.dsh/profiles/qqbot/node_modules/@tencent-connect/dsh-qqbot/package.json" ]; then
        echo "[First Run] Installing official QQ Bot plugin..."
        node scripts/install-qqbot.mjs "$(pwd)" || {
            echo "[ERROR] QQ Bot plugin install failed."
            return 1
        }
    fi

    echo "========================================"
    echo "  QQ Bot running - AppID: $QQBOT_APPID"
    echo "========================================"
    echo
    echo "  Mention the bot in a group, or DM it directly."
    echo "  A model API key must be set in the Web UI first."
    echo "  Press Ctrl+C to stop."
    echo
    (cd src && node apps/cli/lib/bin.js --profile qqbot)
}

while true; do
    echo
    echo "========================================"
    echo "  DeepSeek Harness Portable"
    echo "========================================"
    echo
    echo "  [1] Web UI          - browser at 127.0.0.1:3000"
    echo "  [2] QQ Bot          - chat with the agent on QQ"
    echo "  [3] Set QQ creds    - enter AppID / AppSecret"
    echo "  [0] Exit"
    echo
    read -r -p "Select [1]: " CHOICE
    CHOICE="${CHOICE:-1}"

    case "$CHOICE" in
        1)
            echo
            echo "  URL: http://127.0.0.1:3000"
            echo "  Press Ctrl+C to stop"
            echo
            (cd src && node apps/cli/lib/bin.js web --port 3000)
            ;;
        2) start_qqbot ;;
        3) set_credentials ;;
        0) exit 0 ;;
        *) echo "Invalid choice." ;;
    esac
done
