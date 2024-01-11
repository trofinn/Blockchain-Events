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
import {blockChainFactoryContract} from "../../../helper/blockchain.js";
import {CalendarIcon} from "@radix-ui/react-icons"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/ui/avatar"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../../../components/ui/hover-card"
import {GetAllEvents} from "../../../api-calls/events.js";
import {toast} from "react-hot-toast";


function Header({onAccountChange}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const [isMetaMaskConnected, setIsMetamaskConnected] = useState(false);
    const [reputation, setReputation] = useState("");
    const [accountAddress, setAccountAddress] = useState("");
    const [allEvents, setAllEvents] = useState([]);

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
        const reputation = await blockChainFactoryContract.getUserGlobalReputation(data);
        setReputation(reputation);
    }
    const getMyEvents = async () => {
        try {
            const eventsResponse = await blockChainFactoryContract.getAllEvents();
            const response = await GetAllEvents(eventsResponse);
            if(response.success) {
                setAllEvents(response.data);
            }
            else {
                console.log("error getting the events");
            }
        } catch (e) {
            toast.error(e);
        }
    }

    useEffect(() => {
        if (isMetaMaskInstalled) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            handleConnectClick();
            return () => {
                window.ethereum.off('accountsChanged', handleAccountsChanged);
            };
        }
    }, [handleAccountsChanged, isMetaMaskInstalled]);

    useEffect(() => {
        getMyEvents();
    }, []);

    const handleConnectClick = async () => {
        try {
            if (isMetaMaskInstalled) {
                // Request connection only if MetaMask is installed
                await window.ethereum.request({method: 'eth_requestAccounts'});
                const accounts = await window.ethereum.request({method: 'eth_accounts'});
                if (accounts.length > 0) {
                    await getReputation(accounts[0]);
                    setIsMetamaskConnected(true);
                    setAccountAddress(accounts[0]);
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


    return <div className="header w-[100vw] h-[6vh] flex justify-between pl-[16vw] pr-[21vw]">
        {isMetaMaskConnected ? (
            <div className="flex max-w-sm items-center">
                <Card className="text-center">
                    <Button
                        onClick={handleConnectClick}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] bg-blue-800 border-0 text-white justify-center hover:bg-blue-900 hover:text-white"
                    >
                        Connected
                    </Button>
                </Card>
            </div>

        ) : (
            <div className="flex max-w-sm items-center">
                <Card className="text-center">
                    <Button
                        onClick={handleConnectClick}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] bg-blue-800 border-0 text-white justify-center hover:bg-blue-900 hover:text-white"
                    >
                        Connect to wallet
                    </Button>
                </Card>
            </div>
        )}

        <div className="flex items-center ">
            <div className="flex items-center">
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Avatar className="mr-2">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 bg-gray-800 text-white">
                        <div className="flex justify-between space-x-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold">@blockevents</h4>
                                <p className="text-sm">
                                    Reputation: {reputation.toString()}
                                </p>
                                <div className="flex items-center pt-2">
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70"/>{" "}
                                    <span className="text-xs text-muted-foreground">
                Joined December 2023
              </span>
                                </div>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard>

                <p className="text-white">{accountAddress}</p>
            </div>
        </div>

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
                            ? allEvents.find((event) => event.blockAddress === value)?.label
                            : "Search event by address"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search event by address"/>
                        <CommandEmpty>No event found.</CommandEmpty>
                        <CommandGroup>
                            {allEvents.map((event) => (
                                <CommandItem
                                    key={event._id}
                                    value={event.blockAddress}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === event.blockAddress ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <a href={`/events/${event.blockAddress}`} className="event-link">{event.name}</a>
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