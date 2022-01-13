import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import getRequiredLabel from "../utils/getRequiredLabel";

export const MoneyWidget: React.FC<WidgetProps> = ({ schema, id, disabled, formData, label, required, onChange }) => {
  return (
    <>
      <label htmlFor={id}>{getRequiredLabel(label, required)}</label>
      <NumberFormat
        thousandSeparator
        fixedDecimalScale
        id={id}
        prefix="$"
        disabled={disabled}
        className="money"
        decimalScale={2}
        defaultValue={(schema as any).defaultValue}
        value={formData}
        onValueChange={({ floatValue }) => onChange(floatValue)}
        style={{ border: "2px solid #606060", borderRadius: "0.25em", padding: "0.5em" }}
      />
    </>
  );

};

export default MoneyWidget;
