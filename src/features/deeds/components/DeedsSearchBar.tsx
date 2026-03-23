import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DeedsSearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

const DeedsSearchBar = ({
	value,
	onChange,
	placeholder = "Search deeds...",
}: DeedsSearchBarProps) => (
	<div className="relative">
		<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
		<Input
			placeholder={placeholder}
			className="pl-10"
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	</div>
);

export default DeedsSearchBar;
