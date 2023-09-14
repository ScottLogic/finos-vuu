import { LayoutJSON } from "@finos/vuu-layout";

export type LayoutMetadata = {
  name: string;
  group: string;
  screenshot: string;
  user: string;
  date: string;
};

export type Layout = {
  id: string,
  json: LayoutJSON;
  metadata: LayoutMetadata;
};
