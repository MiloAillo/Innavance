import { useState } from "react";
import type { JSX } from "react/jsx-runtime";

export interface AddonCounterProps {
    name: string,
    maximum: number,
    price: number,
    id: number,
    onCountChange?: (id: number, count: number) => void
}

export function AddonCounter({name, maximum, price, id, onCountChange}: AddonCounterProps): JSX.Element {
    const [count, setCount] = useState(0)

    const handleCountChange = (newCount: number) => {
        setCount(newCount)
        if (onCountChange) {
            onCountChange(id, newCount)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-3 bg-neutral-50/50 rounded-lg border border-neutral-200 hover:border-neutral-400 transition-colors">
            <div className="flex flex-col flex-1">
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-neutral-500">Rp.{(count * price).toLocaleString("ID")}</p>
            </div>
            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-md p-1">
                <button 
                    onClick={() => handleCountChange(count !== 0 ? count - 1 : count)} 
                    className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded transition-colors text-sm"
                >
                    −
                </button>
                <div className="w-8 h-6 flex items-center justify-center text-sm font-semibold text-neutral-800 border-l border-r border-neutral-200">
                    {count}
                </div>
                <button 
                    onClick={() => handleCountChange(count < maximum ? count + 1 : count)} 
                    className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded transition-colors text-sm"
                >
                    +
                </button>
            </div>
        </div>
    )
}