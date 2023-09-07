import { LayoutJSON } from "../layout-reducer";
import { LayoutMetadata } from "@finos/vuu-shell";

export interface LayoutPersistenceManager {
  /**
   * Saves a new layout
   *
   * @param metadata - Metadata about the layout to be saved (without ID)
   * @param layout   - Full JSON representation of the layout to be saved
   *
   * @returns ID assigned to the saved layout
   */
  saveLayout: (metadata: Omit<LayoutMetadata, "id">, layout: LayoutJSON) => string;

  /**
   * Overwrites an existing layout with a new one
   *
   * @param metadata - Metadata (including unique identifier) about the existing layout to be overwritten
   * @param layout   - Full JSON representation of the new layout to overwrite with
   *
   * @returns Version number assigned to the updated layout
   */
  updateLayout: (metadata: LayoutMetadata, layout: LayoutJSON) => number;

  /**
   * Deletes an existing layout
   *
   * @param id - Unique identifier of the existing layout to be deleted
   *
   * @returns true if delete was successful, false if delete was unsuccessful
   */
  deleteLayout: (id: string) => boolean;

  /**
   * Retrieves an existing layout
   *
   * @param id - Unique identifier of the existing layout to be deleted
   *
   * @returns the layout corresponding to provided metadata
   */
  loadLayout: (id: string) => LayoutJSON;

  /**
   * Retrieves metadata for all existing layouts
   *
   * @returns an array of all persisted layout metadata
   */
  loadMetadata: () => LayoutMetadata[];

  /**
   * Retrieves metadata for all existing layouts created by a given user
   *
   * @param user - Name of user
   *
   * @returns an array of metadata describing all persisted layouts created by {@link user}
   */
  loadMetadataByUser: (user: string) => LayoutMetadata[];
}
