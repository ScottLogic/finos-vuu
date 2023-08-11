import { toSvg } from "html-to-image";
import "./Screenshot.css";
import { useState } from "react";
import { DefaultJsonTable } from "../Table/JsonTable.examples";

let displaySequence = 1;

function Parrot() {
  return (
    <div className="parrot animal">
      <div className="beak"></div>
      <div className="parrot-tail"></div>
    </div>
  );
}

export const Screenshot = () => {
  const [imgSrc, setImgSrc] = useState("");

  function filter(node: HTMLElement) {
    return (
      node.innerText !== null &&
      node.innerText !== undefined &&
      node.innerText !== ""
    );
  }

  function takeScreenshotWithFilter(node: HTMLElement) {
    try {
      toSvg(node, {
        cacheBust: true,
        filter,
      }).then(function (dataUrl) {
        setImgSrc(dataUrl);
      });
    } catch (error) {
      console.log("Error taking screenshot", error);
    }
  }

  function takeScreenshot(node: HTMLElement) {
    try {
      toSvg(node, { cacheBust: true }).then(function (dataUrl) {
        setImgSrc(dataUrl);
      });
    } catch (error) {
      console.log("Error taking screenshot", error);
    }
  }

  const handleScreenshot = (elementId: string) => {
    const node = document.getElementById(elementId);

    if (!node) {
      return;
    }

    if (elementId === "jsonTable") {
      takeScreenshotWithFilter(node);
    }

    takeScreenshot(node);
  };

  return (
    <div className="layout">
      <h1>Screenshot Proof of Concept</h1>
      <div id="parrot">
        <Parrot />
      </div>
      <button
        onClick={() => {
          handleScreenshot("parrot");
        }}
      >
        Take Screenshot
      </button>
      <div id="text">Take a screenshot of this</div>
      <button
        onClick={() => {
          handleScreenshot("text");
        }}
      >
        Take Screenshot
      </button>
      <div id="jsonTable">
        <DefaultJsonTable />
      </div>
      <button
        onClick={() => {
          handleScreenshot("jsonTable");
        }}
      >
        Take Screenshot
      </button>
      Screenshot:
      <img
        id="screenshot-from-state"
        className="screenshot"
        src={imgSrc}
        alt="screenshot-from-state"
      />
    </div>
  );
};

Screenshot.displaySequence = displaySequence++;
