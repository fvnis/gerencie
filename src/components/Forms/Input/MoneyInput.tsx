import { useReducer } from "react";
import { FormControl, FormField, FormItem, FormLabel } from "../../ui/form"; // Shadcn UI import
import { Input } from "../../ui/input"; // Shandcn UI Input
import { InputProps } from "@/types/InputProps";
import React from "react";

// Brazilian currency config
const moneyFormatter = Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  currencyDisplay: "symbol",
  currencySign: "standard",
  style: "currency",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function MoneyInput(props: InputProps) {
  const initialValue = props.form.getValues()[props.name]
    ? moneyFormatter.format(Number(props.form.getValues()[props.name]))
    : "";

  const [value, setValue] = useReducer((_: unknown, next: string) => {
    const digits = next.replace(/\D/g, "");
    return moneyFormatter.format(Number(digits) / 100);
  }, initialValue);

  function handleChange(
    realChangeFn: (...event: unknown[]) => void,
    formattedValue: string
  ) {
    const digits = formattedValue.replace(/\D/g, "");
    const realValue = Number(digits) / 100;
    realChangeFn(realValue);
  }

  React.useEffect(() => {
    if (props.defaultValue) {
      const formattedDefaultValue = moneyFormatter.format(
        Number(props.defaultValue)
      );
      setValue(formattedDefaultValue);
    }
  }, [props.defaultValue]);

  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => {
        field.value = value;
        const _change = field.onChange;

        return (
          <FormItem>
            {props.label && <FormLabel>{props.label}</FormLabel>}
            <FormControl>
              <Input
                placeholder={props.placeholder}
                type="text"
                {...field}
                onChange={(ev) => {
                  setValue(ev.target.value);
                  handleChange(_change, ev.target.value);
                }}
                value={value}
              />
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
