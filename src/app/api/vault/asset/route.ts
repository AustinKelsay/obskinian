/**
 * Vault asset API — serves images and other files from the vault directory.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getVaultRoot } from "@/lib/vault/vault-fs";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
};

/** Returns a vault asset file with correct content type */
export async function GET(request: NextRequest) {
  try {
    const assetPath = request.nextUrl.searchParams.get("path");
    if (!assetPath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    const vaultRoot = path.resolve(getVaultRoot());
    const fullPath = path.resolve(vaultRoot, assetPath);

    if (!fullPath.startsWith(vaultRoot + path.sep) && fullPath !== vaultRoot) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    const buffer = fs.readFileSync(fullPath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read asset" },
      { status: 500 }
    );
  }
}
