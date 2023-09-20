export const defaultLayout = {
  type: "Stack",
  props: {
    className: "vuuShell-mainTabs",
    TabstripProps: {
      allowAddTab: true,
      allowRenameTab: true,
      animateSelectionThumb: false,
      location: "main-tab",
    },
    preserve: true,
    active: 0,
  },
  children: [
    {
      type: "Stack",
      props: {
        active: 0,
        title: "My Temp Layout",
        TabstripProps: {
          allowRenameTab: true,
          allowCloseTab: true,
        },
      },
      children: [
        {
          type: "View",
          props: {
            title: "Temp European Stock",
          },
          style: { height: "calc(100% - 6px)" },
          children: [
            {
              type: "AutoTableNext",
            },
          ],
        },
        {
          type: "View",
          props: {
            title: "Temp Other Stock",
          },
          style: { height: "calc(100% - 6px)" },
          children: [
            {
              type: "AutoTableNext",
            },
          ],
        },
      ],
    },
  ],
};

export const warningLayout = {
  type: "View",
  props: {
    style: { height: "calc(100% - 6px)" },
  },
  children: [
    {
      props: {
        className: "vuuShell-warningPlaceholder",
      },
      type: "Placeholder",
    },
  ],
};
