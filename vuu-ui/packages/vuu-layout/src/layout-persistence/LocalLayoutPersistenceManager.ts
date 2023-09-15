import { Layout, LayoutMetadata, PersistedLayoutMetadata } from "@finos/vuu-shell";
import { LayoutJSON, LayoutPersistenceManager } from "@finos/vuu-layout";

import { getLocalEntity, saveLocalEntity } from "@finos/vuu-filters";
import { getUniqueId } from "@finos/vuu-utils";

export class LocalLayoutPersistenceManager implements LayoutPersistenceManager {
  saveLayout(metadata: LayoutMetadata, layout: LayoutJSON): string {
    console.log(`Saving layout as ${metadata.name} to group ${metadata.group}...`);

    const id = getUniqueId();

    const newLayout = {
      id: id,
      metadata: metadata,
      json: layout
    } as Layout;

    const layouts = this.getExistingLayouts();
    layouts.push(newLayout);
    saveLocalEntity<Layout[]>("layouts", layouts);

    return id;
  }

  updateLayout(id: string, newMetadata: LayoutMetadata, newLayoutJson: LayoutJSON): void {
    const layouts = this.getExistingLayouts().filter(layout => layout.id !== id);

    const newLayout = {
      id: id,
      json: newLayoutJson,
      metadata: newMetadata
    };

    layouts.push(newLayout);

    saveLocalEntity<Layout[]>("layouts", layouts);
  };

  deleteLayout(id: string): void {
    const layouts = this.getExistingLayouts().filter(layout => layout.id !== id);
    saveLocalEntity<Layout[]>("layouts", layouts);
  };

  loadLayout(id: string): LayoutJSON {
    const layout = this.getExistingLayouts().filter(layout => layout.id === id);

    switch (layout.length) {
      case 1: {
        return layout[0].json;
      }
      case 0: {
        console.log(`WARNING: no layout exists for ID "${id}"; returning empty layout`);
        return {} as LayoutJSON;
      }
      default: {
        console.log(`WARNING: multiple layouts exist for ID "${id}"; returning first instance`)
        return layout[0].json;
      }
    }
  };

  loadMetadata(): PersistedLayoutMetadata[] {
    const layouts = this.getExistingLayouts();
    return this.getPersistedMetadata(layouts);
  };

  loadMetadataByUser(user: string): PersistedLayoutMetadata[] {
    const layouts = this.getExistingLayouts()
      .filter(layout => layout.metadata.user === user);

    return this.getPersistedMetadata(layouts);
  };

  // TODO: remove
  loadLayouts(): Layout[] {
    return this.getExistingLayouts();
  }

  private getExistingLayouts() {
    return getLocalEntity<Layout[]>("layouts") || [];
  }

  private getPersistedMetadata(layouts: Layout[]): PersistedLayoutMetadata[] {
    const metadata = [] as PersistedLayoutMetadata[];

    for (var layout of layouts) {
      const newMetadata = {
        id: layout.id,
        metadata: layout.metadata
      } as PersistedLayoutMetadata;
      metadata.push(newMetadata);
    }

    return metadata;
  }
}
