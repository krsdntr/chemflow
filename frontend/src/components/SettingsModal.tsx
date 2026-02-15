import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"

import { Button } from "./ui/button"
import { Settings } from "lucide-react"

export function SettingsModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" /> Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure global application preferences.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="theme" className="text-right">
                            Theme
                        </Label>
                        <select id="theme" className="col-span-3 h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <option value="light">Light Mode</option>
                            <option value="dark" disabled>Dark Mode (Coming Soon)</option>
                            <option value="system" disabled>System</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="units" className="text-right">
                            Units
                        </Label>
                        <select id="units" className="col-span-3 h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <option value="metric">Metric (SI)</option>
                            <option value="imperial" disabled>Imperial</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-xs text-slate-500 col-span-4">
                            API Version: v1.0.0
                        </Label>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
