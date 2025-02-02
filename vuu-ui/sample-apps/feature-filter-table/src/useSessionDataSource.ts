import { VuuDataSource } from "@finos/vuu-data-remote";
import {
  DataSource,
  DataSourceConfig,
  TableSchema,
} from "@finos/vuu-data-types";
import { configChanged } from "@finos/vuu-utils";
import { useViewContext } from "@finos/vuu-layout";
import { useCallback, useMemo } from "react";

type SessionDataSourceConfig = {
  "datasource-config"?: DataSourceConfig;
};

const NO_CONFIG: SessionDataSourceConfig = {};

export const useSessionDataSource = ({
  dataSourceSessionKey = "data-source",
  tableSchema,
}: {
  dataSourceSessionKey?: string;
  tableSchema: TableSchema;
}) => {
  const { id, load, save, loadSession, saveSession, title } = useViewContext();

  const { "datasource-config": dataSourceConfigFromState } =
    useMemo<SessionDataSourceConfig>(() => load?.() ?? NO_CONFIG, [load]);

  const handleDataSourceConfigChange = useCallback(
    (config: DataSourceConfig | undefined, confirmed?: boolean) => {
      if (
        // confirmed / unconfirmed messages are used for UI updates, not state saving
        confirmed === undefined &&
        configChanged(dataSourceConfigFromState, config)
      ) {
        save?.(config, "datasource-config");
      }
    },
    [dataSourceConfigFromState, save]
  );

  const dataSource: DataSource = useMemo(() => {
    let ds = loadSession?.(dataSourceSessionKey) as VuuDataSource;
    if (ds) {
      console.log(
        "%useSessionDataSource DATA SOURCE IN SESSION STATE",
        "color:red;font-weight:bold;"
      );

      // Only required when injecting a dataSource into session
      // state in Showcase examples
      if (!ds.hasListener("config", handleDataSourceConfigChange)) {
        ds.on("config", handleDataSourceConfigChange);
      }

      if (dataSourceConfigFromState) {
        // this won't do anything if dataSource config already matches this
        // This is only really used when injecting a dataSource into session
        // state in Showcase examples
        ds.applyConfig(dataSourceConfigFromState);
      }

      return ds;
    }

    const columns =
      dataSourceConfigFromState?.columns ??
      tableSchema.columns.map((col) => col.name);

    ds = new VuuDataSource({
      bufferSize: 0,
      // bufferSize: 200,
      viewport: id,
      table: tableSchema.table,
      ...dataSourceConfigFromState,
      columns,
      title,
    });
    ds.on("config", handleDataSourceConfigChange);
    saveSession?.(ds, "data-source");
    return ds;
  }, [
    dataSourceConfigFromState,
    handleDataSourceConfigChange,
    id,
    loadSession,
    saveSession,
    tableSchema.columns,
    tableSchema.table,
    title,
  ]);

  return dataSource;
};
