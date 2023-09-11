import { Layout, LayoutMetadata } from "@finos/vuu-shell";
import { LayoutJSON, LayoutPersistenceManager } from "@finos/vuu-layout";

import { getLocalEntity, saveLocalEntity } from "@finos/vuu-filters";
import { getUniqueId } from "@finos/vuu-utils";

export class LocalLayoutPersistenceManager implements LayoutPersistenceManager {
  saveLayout(layouts: Layout[]): string {
    console.log(`Saving layout as ${layouts[0]?.metadata.name} to group ${layouts[0]?.metadata.group}...`);
    saveLocalEntity<Layout[]>("layouts", layouts);
    return layouts[0]?.metadata.id;
  }

  updateLayout(id: string, newMetadata: Omit<LayoutMetadata, "id">, newLayoutJson: LayoutJSON): void {
    const layouts = this.getExistingLayouts();
    const layoutJson = getLocalEntity<LayoutJSON>("api/vui");

    if (layoutJson) {
      layouts.filter(layout => layout.metadata.id !== id)
      const newLayout = {json: newLayoutJson, metadata: newMetadata} as Layout;
      layouts.push(newLayout);
    }

    saveLocalEntity<Layout[]>("layouts", layouts);
  };

  deleteLayout(id: string): void {
    const layouts = this.getExistingLayouts().filter(layout => layout.metadata.id !== id);
    saveLocalEntity<Layout[]>("layouts", layouts);
  };

  loadLayout(id: string): LayoutJSON {
    const layout = this.getExistingLayouts().filter(layout => layout.metadata.id === id);

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

  loadMetadata(): LayoutMetadata[] {
    return this.getExistingLayouts().map(layout => layout.metadata);
  };

  loadMetadataByUser(user: string): LayoutMetadata[] {
    return this.getExistingLayouts()
      .filter(layout => layout.metadata.user === user)
      .map(layout => layout.metadata);
  };

  private getExistingLayouts() {
    return getLocalEntity<Layout[]>("layouts") || [];
  }

  // TODO: remove
  loadLayouts(): Layout[] {
    return this.getExistingLayouts();
  }
}
