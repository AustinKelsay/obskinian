/**
 * Plugin system types and registry for extensibility.
 * Provides a hook-based architecture similar to Obsidian plugins.
 */

/** Lifecycle hooks available to plugins */
export interface PluginHooks {
  onVaultLoad?: () => void;
  onFileOpen?: (filePath: string) => void;
  onFileSave?: (filePath: string, content: string) => void;
  onFileCreate?: (filePath: string) => void;
  onFileDelete?: (filePath: string) => void;
}

/** Plugin metadata and hook implementations */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  hooks?: PluginHooks;
}

/** Command contributed by a plugin or core app */
export interface AppCommand {
  id: string;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

/** Central plugin registry */
class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private commands: AppCommand[] = [];

  /** Registers a plugin */
  register(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  /** Unregisters a plugin by id */
  unregister(id: string): void {
    this.plugins.delete(id);
  }

  /** Returns all registered plugins */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /** Registers a command (from plugin or core) */
  registerCommand(command: AppCommand): void {
    const existing = this.commands.findIndex((c) => c.id === command.id);
    if (existing >= 0) {
      this.commands[existing] = command;
    } else {
      this.commands.push(command);
    }
  }

  /** Returns all registered commands */
  getCommands(): AppCommand[] {
    return this.commands;
  }

  /** Fires a hook across all plugins */
  fireHook(hookName: keyof PluginHooks, ...args: unknown[]): void {
    for (const plugin of this.plugins.values()) {
      const hook = plugin.hooks?.[hookName];
      if (hook) {
        (hook as (...a: unknown[]) => void)(...args);
      }
    }
  }
}

export const pluginRegistry = new PluginRegistry();

/** Registers built-in demo plugins on app startup */
export function registerBuiltinPlugins(): void {
  pluginRegistry.register({
    id: "word-count",
    name: "Word Count",
    version: "1.0.0",
    description: "Shows word and character count in the status bar",
    author: "Obskinian",
  });

  pluginRegistry.register({
    id: "graph-view",
    name: "Graph View",
    version: "1.0.0",
    description: "Force-directed graph visualization of note connections",
    author: "Obskinian",
  });

  pluginRegistry.register({
    id: "daily-notes",
    name: "Daily Notes",
    version: "1.0.0",
    description: "Daily note templates and navigation",
    author: "Obskinian",
    hooks: {
      onVaultLoad: () => {
        /* scaffold for daily notes auto-open */
      },
    },
  });
}
