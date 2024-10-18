import { dateFns } from "@/lib/date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { ComponentProps, Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type GhostDatePickerProps = {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  calendarProps?: ComponentProps<typeof Calendar>;
};

const GhostDatePicker = ({
  date,
  setDate,
  calendarProps,
}: GhostDatePickerProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsPopoverOpen(false);
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(!date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              dateFns.format(date, "PPP")
            ) : (
              <span>Choisissez une date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            {...calendarProps}
            mode="single"
            onSelect={onDateSelect}
            selected={date}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};

export { GhostDatePicker };
