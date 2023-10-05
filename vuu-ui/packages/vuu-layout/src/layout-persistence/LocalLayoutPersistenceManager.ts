import { Layout, LayoutMetadata, WithId } from "@finos/vuu-shell";
import { LayoutJSON, LayoutPersistenceManager } from "@finos/vuu-layout";

import { getLocalEntity, saveLocalEntity } from "@finos/vuu-filters";
import { getUniqueId } from "@finos/vuu-utils";

const metadataSaveLocation = "layouts/metadata";
const layoutsSaveLocation = "layouts/layouts";

export class LocalLayoutPersistenceManager implements LayoutPersistenceManager {
  createLayout(metadata: Omit<LayoutMetadata, "id">, layout: LayoutJSON): Promise<string> {
    return new Promise(resolve => {
      console.log(`Saving layout as ${metadata.name} to group ${metadata.group}...`);

      Promise.all([this.loadLayouts(), this.loadMetadata()])
        .then(([existingLayouts, existingMetadata]) => {
          const id = getUniqueId();
          this.appendAndPersist(
            id,
            metadata,
            layout,
            existingLayouts,
            existingMetadata
          );
          resolve(id);
        });
    })
  }

  updateLayout(id: string, newMetadata: Omit<LayoutMetadata, "id">, newLayout: LayoutJSON): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadAndFilter(id)
        .then(([layouts, metadata]) => {
          this.appendAndPersist(id, newMetadata, newLayout, layouts, metadata);
          resolve();
        })
        .catch(e => reject(e));
    });
  }

  deleteLayout(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadAndFilter(id)
        .then(([layouts, metadata]) => {
          this.saveLayoutsWithMetadata(layouts, metadata);
          resolve();
        })
        .catch(e => reject(e));
    });
  }

  loadLayout(id: string): Promise<LayoutJSON> {
    return new Promise((resolve, reject) => {
      this.validateId(id, "layout")
        .then(() => this.loadLayouts())
        .then(existingLayouts => {
          const layouts = existingLayouts.find(layout => layout.id === id) as Layout;
          resolve(layouts.json);
        })
        .catch(e => reject(e));
    });
  }

  loadMetadata(): Promise<LayoutMetadata[]> {
    return new Promise(resolve => {
      const metadata = getLocalEntity<LayoutMetadata[]>(metadataSaveLocation);
      resolve(metadata || []);
    })
  }

  private loadLayouts(): Promise<Layout[]> {
    return new Promise(resolve => {
      const layouts = getLocalEntity<Layout[]>(layoutsSaveLocation);
      resolve(layouts || []);
    });
  }

  private async loadAndFilter(idToRemove: string): Promise<[Layout[], LayoutMetadata[]]> {
    await this.validateIds(idToRemove);

    const [existingLayouts, existingMetadata] =
      await Promise.all([this.loadLayouts(), this.loadMetadata()]);

    const layouts = this.removeId<Layout>(existingLayouts, idToRemove);
    const metadata = this.removeId<LayoutMetadata>(existingMetadata, idToRemove);

    return [layouts, metadata];
  }

  private removeId<T extends WithId>(array: T[], idToRemove: string): T[] {
    return array.filter(element => element.id !== idToRemove);
  }

  private appendAndPersist(
    newId: string,
    newMetadata: Omit<LayoutMetadata, "id">,
    newLayout: LayoutJSON,
    existingLayouts: Layout[],
    existingMetadata: LayoutMetadata[]
  ) {
    existingLayouts.push({ id: newId, json: newLayout });
    existingMetadata.push({ id: newId, ...newMetadata });

    this.saveLayoutsWithMetadata(existingLayouts, existingMetadata);
  }

  private saveLayoutsWithMetadata(
    layouts: Layout[],
    metadata: LayoutMetadata[]
  ): void {
    saveLocalEntity<Layout[]>(layoutsSaveLocation, layouts);
    saveLocalEntity<LayoutMetadata[]>(metadataSaveLocation, metadata);
  }

  private async validateIds(id: string): Promise<void> {
    return Promise
      .all([
        this.validateId(id, "metadata").catch(error => error.message),
        this.validateId(id, "layout").catch(error => error.message)
      ])
      .then((errorMessages: string[]) => {
        const combinedMessage = errorMessages.filter(Boolean).join("; ");
        if (combinedMessage) {
          throw new Error(combinedMessage);
        }
      });
  }

  private validateId(id: string, dataType: "metadata" | "layout"): Promise<void> {
    return new Promise((resolve, reject) => {
      const loadFunc = dataType === "metadata" ? this.loadMetadata : this.loadLayouts;

      loadFunc().then(result => {
        const count = result.filter(x => x.id === id).length;
        switch (count) {
          case 1: {
            resolve();
            break;
          }
          case 0: {
            reject(new Error(`No ${dataType} with ID ${id}`));
            break;
          }
          default: reject(new Error(`Non-unique ${dataType} with ID ${id}`));
        }
      });
    })
  }
}
