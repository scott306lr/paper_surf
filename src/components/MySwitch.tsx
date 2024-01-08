import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

const MySwitch: React.FC<{
  text: string;
  checked: string;
  setChecked: React.Dispatch<React.SetStateAction<string>>;
}> = ({ text, checked, setChecked }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={text}
        checked={checked === "checked"}
        onCheckedChange={() => {
          setChecked((prev) => (prev === "checked" ? "unchecked" : "checked"));
        }}
      />
      <Label htmlFor={text}>{text}</Label>
    </div>
  );
};

export default MySwitch;
