/**
 * API route: GET loads vault tree, POST creates files/folders.
 * Bridges the physical vault/ directory with the client store.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  readVaultFromDisk,
  createFileOnDisk,
  createFolderOnDisk,
  writeFileToDisk,
  deleteFromDisk,
} from "@/lib/vault/vault-fs";

/** Returns the full vault tree from disk */
export async function GET() {
  try {
    const vault = readVaultFromDisk();
    return NextResponse.json({ vault });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read vault" },
      { status: 500 }
    );
  }
}

/** Creates a new file or folder in the vault */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, path: filePath, content, type } = body as {
      action: string;
      path: string;
      content?: string;
      type?: "file" | "folder";
    };

    if (action === "create") {
      if (type === "folder") {
        createFolderOnDisk(filePath);
        return NextResponse.json({ success: true });
      }
      const file = createFileOnDisk(filePath, content ?? "");
      return NextResponse.json({ file });
    }

    if (action === "update") {
      writeFileToDisk(filePath, content ?? "");
      return NextResponse.json({ success: true });
    }

    if (action === "delete") {
      deleteFromDisk(filePath);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Vault operation failed" },
      { status: 500 }
    );
  }
}

/** Updates file content on disk */
export async function PUT(request: NextRequest) {
  try {
    const { path: filePath, content } = await request.json();
    writeFileToDisk(filePath, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save file" },
      { status: 500 }
    );
  }
}

/** Deletes a file or folder from disk */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    if (!filePath) return NextResponse.json({ error: "Path required" }, { status: 400 });

    deleteFromDisk(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
