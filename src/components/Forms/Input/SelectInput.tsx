import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputProps } from "@/types/InputProps";

export type SelectItems = {
  value: string;
  label: string;
};

interface SelectProps extends InputProps {
  selectItems: Array<SelectItems>;
  placeholder: string;
}

export default function SelectInput(props: SelectProps) {
  return (
    <FormField
      control={props.form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <Select
            onValueChange={field.onChange}
            defaultValue={props.defaultValue}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {props.selectItems.length >= 1 ? (
                props.selectItems.map((i) => (
                  <SelectItem value={i.value} key={i.value + i.label}>
                    {i.label}
                  </SelectItem>
                ))
              ) : (
                <></>
              )}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
