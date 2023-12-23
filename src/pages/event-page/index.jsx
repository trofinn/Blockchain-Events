import React, {useEffect} from "react";
import {Button} from "../../components/ui/button.jsx";
import {toast} from "react-hot-toast";
import {blockChainFactoryContract} from '../../helper/blockchain.js';
import {GetMyEvent} from "../../api-calls/events.js";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../../components/ui/drawer"
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "../../components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel"


function EventPage({data}) {
    const [event, setEvent] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(0)
    const [tickets, setTickets] = React.useState(0);
    const [isMetaMaskConnected, setIsMetaMaskConnected] = React.useState(false);
    const plugin = React.useRef(Autoplay({delay: 2000, stopOnInteraction: true}))

    const buyTicket = async (quantity) => {
        try {
            await blockChainFactoryContract.buyTickets(event.blockAddress,quantity);
        } catch (e) {
            toast.error(e);
        }
    }
    const onClick = (adjustment) => {
        setQuantity(quantity + adjustment);
    }

    const getMyEvent = async () => {
        if (isMetaMaskConnected) {
            const currentUrl = window.location.href;

            // Use regular expression to extract hex address
            const regex = /0x[a-fA-F0-9]+/;
            const matches = currentUrl.match(regex);

            if (matches && matches.length > 0) {
                const hexAddress = matches[0];
                try {
                    const response = await GetMyEvent(hexAddress);
                    if (response.success) {
                        setEvent(response.data[0]);
                        const ticketsAvailable = await blockChainFactoryContract.getUserOwnedNFTsForEvent(hexAddress);
                        console.log(ticketsAvailable);
                        setTickets(ticketsAvailable.length);
                        setLoading(false);
                    } else {
                        console.log("error");
                    }
                } catch (error) {
                    console.error('Error fetching event data:', error);
                }
            } else {
                console.error('Hex address not found in the URL');
            }
        }
    }

    useEffect(() => {
        const checkMetaMaskConnection = async () => {
            // Check if MetaMask is installed and connected
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                setIsMetaMaskConnected(accounts.length > 0);
            } else {
                setIsMetaMaskConnected(false);
            }
        };

        checkMetaMaskConnection();
    }, []);

    useEffect(() => {
        getMyEvent();
    }, [data]);

    return (
        <>
            <div className="w-full rounded m-1" id="content">
                {loading ? (
                    <p>
                        Loading..
                    </p>
                ) : (
                    <div>
                        <h1 className="ml-6" id="homeTitle"><i>{event.name}</i></h1>
                        <h2 className="ml-6">{event.address}</h2>
                        <div>
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant="outline">Buy Tickets</Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                    <div className="mx-auto w-full max-w-sm">
                                        <DrawerHeader>
                                            <DrawerTitle>How many tickets you want?</DrawerTitle>
                                        </DrawerHeader>
                                        <div className="p-4 pb-0">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 rounded-full"
                                                    onClick={() => onClick(-1)}
                                                    disabled={quantity === 0}
                                                >
                                                    <MinusIcon className="h-4 w-4" />
                                                    <span className="sr-only">Decrease</span>
                                                </Button>
                                                <div className="flex-1 text-center">
                                                    <div className="text-7xl font-bold tracking-tighter">
                                                        {quantity}
                                                    </div>
                                                    <div className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Tickets
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 rounded-full"
                                                    onClick={() => onClick(1)}
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                    <span className="sr-only">Increase</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <DrawerFooter>
                                            <Button onClick={buyTicket(quantity)}>Buy Tickets</Button>
                                            <DrawerClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DrawerClose>
                                        </DrawerFooter>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        </div>
                        <div>
                            <Carousel
                                plugins={[plugin.current]}
                                className="w-full max-w-xs"
                                onMouseEnter={plugin.current.stop}
                                onMouseLeave={plugin.current.reset}
                            >
                                <CarouselContent>
                                    {Array.from({ length: tickets }).map((_, index) => (
                                        <CarouselItem key={index}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                                        <span className="text-4xl font-semibold">{index + 1}</span>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default EventPage;