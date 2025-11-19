import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface DelayPopoverProps {
    currentDelay: {
        delay: number;
        unit: string;
    };
    onSave: (delayConfig: { delay: number; unit: string }) => void;
    children: React.ReactNode;
}

export const DelayPopover = ({ currentDelay, onSave, children }: DelayPopoverProps) => {
    const [delay, setDelay] = useState(currentDelay.delay);
    const [unit, setUnit] = useState(currentDelay.unit);
    const [isOpen, setIsOpen] = useState(false);

    // Ensure state is synced with props
    useEffect(() => {
        setDelay(currentDelay.delay);
        setUnit(currentDelay.unit);
    }, [currentDelay]);

    const handleSave = () => {
        onSave({ delay: Number(delay), unit });
        setIsOpen(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    const presetDelays = [
        { delay: 0, unit: 'm', label: 'No delay' },
        { delay: 5, unit: 'm', label: '5m' },
        { delay: 15, unit: 'm', label: '15m' },
        { delay: 30, unit: 'm', label: '30m' },
        { delay: 1, unit: 'h', label: '1h' },
        { delay: 2, unit: 'h', label: '2h' },
        { delay: 1, unit: 'd', label: '1d' },
    ];

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent
                className="w-64 p-3"
                align="center"
                onPointerDownOutside={e => {
                    // Prevent closing when clicking on React Flow elements
                    const target = e.target as Element;
                    if (target.closest('.react-flow')) {
                        e.preventDefault();
                    }
                }}>
                <div className="space-y-3" onClick={e => e.stopPropagation()}>
                    <div>
                        <Label className="text-sm font-medium">Delay Duration</Label>
                        <p className="text-xs text-muted-foreground">Set the waiting time before the next action.</p>
                    </div>

                    {/* Quick presets */}
                    <div className="flex flex-wrap gap-1">
                        {presetDelays.map(preset => (
                            <Button
                                key={`${preset.delay}-${preset.unit}`}
                                variant={delay === preset.delay && unit === preset.unit ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setDelay(preset.delay);
                                    setUnit(preset.unit);
                                }}
                                className="text-xs h-7 px-2">
                                {preset.label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom input */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input type="number" min="0" value={delay} onChange={e => setDelay(Number(e.target.value))} placeholder="0" className="h-8 text-sm" />
                        </div>
                        <div className="w-20">
                            <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="s">Seconds</SelectItem>
                                    <SelectItem value="m">Minutes</SelectItem>
                                    <SelectItem value="h">Hours</SelectItem>
                                    <SelectItem value="d">Days</SelectItem>
                                    <SelectItem value="w">Weeks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} size="sm" className="h-7 px-3 text-xs">
                            Save
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
