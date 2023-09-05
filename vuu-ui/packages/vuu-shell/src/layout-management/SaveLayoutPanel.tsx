import { ChangeEvent, useState } from "react";
import { Input, Button, FormField, FormFieldLabel, Text } from "@salt-ds/core";
import { ComboBox, Checkbox, RadioButton, RadioIcon } from "@finos/vuu-ui-controls";

import "./SaveLayoutPanel.css";

const classBase = "saveLayoutPanel";
const formField = `${classBase}-formField`;

const groups = [
  "Group 1",
  "Group 2",
  "Group 3",
  "Group 4",
  "Group 5"
];

const checkboxValues = [
  "Value 1",
  "Value 2",
  "Value 3"
];

const radioValues = [
  "Value 1",
  "Value 2",
  "Value 3"
] as const;

type RadioValue = typeof radioValues[number];

type SaveLayoutPanelProps = {
  onCancel: () => void;
  onSave: (layoutName: string, group: string, checkValues: string[], radioValue: string) => void;
  screenshot: string | undefined;
};

export const SaveLayoutPanel = (props: SaveLayoutPanelProps) => {
  const { onCancel, onSave, screenshot } = props;

  const [layoutName, setLayoutName] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [checkValues, setCheckValues] = useState<string[]>([]);
  const [radioValue, setRadioValue] = useState<RadioValue>(radioValues[0]);

  return (
    <div className={`${classBase}-panelContainer`}>
      <div className={`${classBase}-panelContent`}>
        <div className={`${classBase}-formContainer`}>
          <FormField className={formField}>
            <FormFieldLabel style={{fontWeight: 400}}>Group</FormFieldLabel>
            <ComboBox
              ListProps={{
                style: {
                  zIndex: 10000,
                  border: "1px solid #777C94",
                  borderRadius: 10,
                  boxSizing: "border-box"
                }
              }}
              source={groups}
              allowFreeText={true}
              InputProps={{
                inputProps: {
                  placeholder: "Select Group or Enter New Name",
                  onChange: (event: ChangeEvent<HTMLInputElement>) => setGroup(event.target.value),
                },
              }}
              width={120}
              onSelectionChange={(_, value) => setGroup(value || "")}
            />
          </FormField>
          <FormField className={formField}>
            <FormFieldLabel style={{fontWeight: 400}}>Layout Name</FormFieldLabel>
            <Input
              inputProps={{ placeholder: "Enter Layout Name" }}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setLayoutName(event.target.value)}
              value={layoutName}
            />
          </FormField>
          <FormField className={formField}>
            <FormFieldLabel style={{fontWeight: 400}}>Some Layout Setting</FormFieldLabel>
            <div className={`${classBase}-settingsGroup`}>
              {checkboxValues.map((value, i) =>
                <Checkbox
                  key={i}
                  onToggle={() => setCheckValues((prev) => prev.includes(value) ? prev.filter(entry => entry !== value) : [...prev, value])}
                  checked={checkValues.includes(value)}
                  label={value}
                />
              )}
            </div>
          </FormField>
          <FormField className={formField}>
            <FormFieldLabel style={{fontWeight: 400}}>Some Layout Setting</FormFieldLabel>
            <div className={`${classBase}-settingsGroup`}>
              {radioValues.map((value, i) =>
                <RadioButton
                  key={i}
                  onClick={() => setRadioValue(value)}
                  checked={radioValue === value}
                  label={value}
                  groupName="radioGroup"
                />
              )}
            </div>
          </FormField>
        </div>
        <div className={`${classBase}-screenshotContainer`}>
          {screenshot ? (
            <img
              className={`${classBase}-screenshot`}
              src={screenshot}
              alt="screenshot of current layout"
            />
          ) : (
            <Text className={`${classBase}-screenshot`}>No screenshot available</Text>
          )}
        </div>
      </div>
      <div className={`${classBase}-buttonsContainer`}>
        <Button className={`${classBase}-cancelButton`} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className={`${classBase}-saveButton`}
          onClick={() => onSave(layoutName, group, checkValues, radioValue)}
          disabled={layoutName === "" || group === ""}>
          Save
        </Button>
      </div>
    </div>
  );
};
