export const str  = (max, extra = {}) => ({ type: "string", max, ...extra });
export const bool = () => ({ type: "boolean" });
export const arr  = (of, min, max) => ({ type: "array", of, min, max });
export const obj  = (props, required) =>
  ({ type: "object", additionalProperties: false, props, required: required ?? Object.keys(props) });
