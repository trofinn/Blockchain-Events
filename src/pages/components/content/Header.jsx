import React, {useCallback, useEffect, useState} from 'react'
import {Button} from "../../../components/ui/button.jsx";
import * as Icon from 'react-bootstrap-icons';
import {Check, ChevronsUpDown} from "lucide-react"
import {cn} from "../../../lib/utils.js"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../../../components/ui/command.jsx"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover.jsx"
import {Card} from "react-bootstrap";
import {blockChainContract} from "../../../helper/blockchain.js";

const frameworks = [
    {
        value: "next.js",
        label: "Next.jsNext.jsNext.jssNext.jssNext.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
]

function Header({onAccountChange}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const [isMetaMaskConnected, setIsMetamaskConnected] = useState(false);
    const [reputation, setReputation] = useState();


    useEffect(() => {
        // Check if MetaMask is installed
        setIsMetaMaskInstalled(!!window.ethereum);
    }, []);

    const handleAccountsChanged = useCallback(
        (accounts) => {
            // Handle the account change by passing it to the parent component
            if (onAccountChange) {
                onAccountChange(accounts[0]);
            }
        },
        [onAccountChange]
    );

    const getReputation = async (data) => {
        const reputation = await blockChainContract.userReputation(data);
        setReputation(reputation);
    }

    useEffect(() => {
        // Listen for the accountsChanged event if MetaMask is installed
        if (isMetaMaskInstalled) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            // Cleanup the event listener when the component is unmounted
            return () => {
                window.ethereum.off('accountsChanged', handleAccountsChanged);
            };
        }
    }, [handleAccountsChanged, isMetaMaskInstalled]);

    const handleClick = async () => {
        try {
            if (isMetaMaskInstalled) {
                // Request connection only if MetaMask is installed
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await window.ethereum.request({method: 'eth_accounts'});
                if (accounts.length > 0) {
                    await getReputation(accounts[0]);
                    setIsMetamaskConnected(true);
                } else {
                    setIsMetamaskConnected(false);
                }
                if (onAccountChange) {
                    onAccountChange(accounts[0]);
                }
            } else {
                // Handle the case when MetaMask is not installed
                console.warn('MetaMask is not installed. Connect MetaMask to access additional features.');
            }
        } catch (error) {
            console.error('Error getting account address:', error);
        }
    };


    return <div className="header w-[100vw] h-[6vh] rounded ml-1 mr-1 mb-1 flex justify-between p-3">
        {isMetaMaskConnected ? (
            <div className="flex">
                <Card className="text-center">
                    <Button
                        onClick={handleClick}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] bg-blue-800 border-0 text-white justify-center hover:bg-blue-900 hover:text-white"
                    >
                        Connected
                    </Button>
                </Card>
                <p>Reputation: {reputation.toString()}</p>
            </div>

        ) : (
            <Card className="text-center">
                <Button
                    onClick={handleClick}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] bg-blue-800 border-0 text-white justify-center hover:bg-blue-900 hover:text-white"
                >
                    Connect to wallet
                </Button>
            </Card>
        )}

        <div className="flex w-full max-w-sm items-center space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[300px] justify-between"
                    >
                        {value
                            ? frameworks.find((framework) => framework.value === value)?.label
                            : "Search event by address"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search event by address"/>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            <Button type="submit"><Icon.Search></Icon.Search> </Button>
        </div>
    </div>
}

export default Header;