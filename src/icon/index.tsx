import { createElement } from "react";
import lookup from "./symbols";

export type IconName = keyof typeof lookup;

type Props = {
  name: IconName;
  class?: string;
  tag?: string;
  [key: string]: any;
};
export const Icon = ({ tag = "i", name, class: c, style: s, ...rest }: Props) => {
  return createElement(
    tag,
    {
      className: `icon icon-${name} ${c || ""}`,
      // style: s || "",
      ...rest,
    },
    lookup[name]
  );
};
