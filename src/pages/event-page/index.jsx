import React, {useEffect} from "react";
import {Button} from "../../components/ui/button.jsx";
import {toast} from "react-hot-toast";
import {blockChainFactoryContract, calculateMaticTokens, getMaticToEuroRate} from '../../helper/blockchain.js';
import {GetMyEvent} from "../../api-calls/events.js";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../../components/ui/drawer"
import {MinusIcon, PlusIcon} from "@radix-ui/react-icons"
import Autoplay from "embla-carousel-autoplay"
import {Card, CardContent} from "../../components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "../../components/ui/carousel"
import moment from 'moment';
import {ScrollArea} from "../../components/ui/scroll-area"
import {Separator} from "../../components/ui/separator"
import * as Icon from 'react-bootstrap-icons';
import {useLocation} from "react-router-dom";
function EventPage({data}) {
    const [event, setEvent] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(0)
    const [tickets, setTickets] = React.useState(0);
    const [isMetaMaskConnected, setIsMetaMaskConnected] = React.useState(false);
    const plugin = React.useRef(Autoplay({delay: 2000, stopOnInteraction: true}));
    const [shouldHideTicketCarousel, setShouldHideTicketCarousel] = React.useState(true);
    const [participants, setParticipants] = React.useState([]);
    let location = useLocation();
    const buyTicket = async () => {
        try {
            const priceInWei = await calculateMaticTokens(event.price);
            const amountToSend = quantity * priceInWei;
            console.log("amountToSend = ",amountToSend);
            await blockChainFactoryContract.buyTickets(event.blockAddress, quantity, {value: amountToSend.toString()});
            setShouldHideTicketCarousel(false);
            setTickets(tickets + quantity);
        } catch (e) {
            toast.error(e);
        }
    }
    const onClick = (adjustment) => {
        setQuantity(quantity + adjustment);
    }

    const getParticipants = async () => {
        const currentUrl = window.location.href;

        // Use regular expression to extract hex address
        const regex = /0x[a-fA-F0-9]+/;
        const matches = currentUrl.match(regex);

        if (matches && matches.length > 0) {
            const hexAddress = matches[0];
            const participants = await blockChainFactoryContract.getParticipantsOfEvent(hexAddress);
            console.log(participants);
            let participantsWithRep = [];
            for (let i = 0; i < participants.length; i++) {
                const reputation = await blockChainFactoryContract.getUserGlobalReputation(participants[i]);
                const participantWithRep = {
                    address: participants[i],
                    reputation: reputation.toString()
                }
                participantsWithRep.push(participantWithRep);
            }
            setParticipants(participantsWithRep);
        }

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
                        setTickets(ticketsAvailable.length);
                        if (ticketsAvailable.length > 0) {
                            setShouldHideTicketCarousel(false);
                        }

                    }
                } catch (error) {
                    console.error('Error fetching event data:', error);
                } finally {
                    setLoading(false);
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
                const accounts = await window.ethereum.request({method: 'eth_accounts'});
                setIsMetaMaskConnected(accounts.length > 0);
            } else {
                setIsMetaMaskConnected(false);
            }
        };

        checkMetaMaskConnection();
    }, []);

    useEffect(() => {
        if(!data || !event) {
            setLoading(true);
        }
        else {
            setLoading(false);
        }
        getMyEvent();
        getParticipants();
    }, [data]);

    return (
        <>
            <div className="w-full rounded m-1" id="content">
                {loading ? (
                    <p>
                        Loading..
                    </p>
                ) : (
                    <div className="mt-20">
                        <div className="flex justify-between">
                            <div className="eventInfos text-white w-[30vw]">
                                <h1 className="ml-5" id="homeTitle"><i>{event.name}</i></h1>
                                <Separator className="ml-5"/>
                                <div className="ml-5 mt-2 flex place-items-center">
                                    <Icon.Nut width="40px" height="40px" color="gray-900"/>
                                    <p className="pl-3 text-purple-500">BlockChain Address: </p>
                                    <p className="pl-1">{event.blockAddress}</p>
                                </div>
                                <Separator className="ml-5 mt-2"/>
                                <div className="ml-5 mt-2 flex place-items-center">
                                    <Icon.CalendarMinus width="40px" height="40px" color="gray-900"/>
                                    <div>
                                        <div className="pl-3 flex">
                                            <p className="text-purple-500">From:</p>
                                            <p className="pl-1">{moment(event.dateStart).format("DD / MM / YYYY")} at {event.hourStart}</p>
                                        </div>
                                        <div className="pl-3 flex ">
                                            <p className="text-purple-500">To: </p>
                                            <p className="pl-1">{moment(event.dateEnd).format("DD / MM / YYYY")} at {event.hourEnd}</p>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="ml-5 mt-2"/>
                                <div className="ml-5 mt-2 flex place-items-center">
                                    <Icon.House width="40px" height="40px" color="gray-900"/>
                                    <p className="pl-3 text-purple-500">{event.address}, {event.city}</p>
                                </div>
                                <Separator className="ml-5 mb-2 mt-2"/>

                                <br/>
                                <br/>
                                <br/>

                                <ScrollArea className="h-40 w-[30vw] rounded-md border mt-2 ml-5 p-2">
                                    <p className="ml-5">{event.description}</p>
                                </ScrollArea>
                            </div>

                            <div className="banner-image-event-page"></div>
                        </div>
                        <div className="mt-10 flex">
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant="outline" className="ml-5 pur bg-gray-900 border-0 text-white">Buy Tickets Now At ${event.price}</Button>
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
                                                    <MinusIcon className="h-4 w-4"/>
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
                                                    <PlusIcon className="h-4 w-4"/>
                                                    <span className="sr-only">Increase</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <DrawerFooter>
                                            <Button onClick={buyTicket}>Buy Tickets</Button>
                                            <DrawerClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DrawerClose>
                                        </DrawerFooter>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                            <div className="stats ml-5">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="w-[22vw] bg-gray-900 border-0 text-white" variant="outline">This event
                                            has {event.tickets - participants.length} more places available. Click to
                                            see the participants</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[26vw] m-0 p-0 bg-gray-900 text-white">
                                        <ScrollArea className="h-60 w-[26vw] rounded-md border m-0 p-2">
                                            {participants.map((val, key) => {
                                                return (
                                                    // eslint-disable-next-line react/jsx-key
                                                    <div>
                                                        <li key={key} className="row flex justify-between">
                                                            <div>{val.address}</div>
                                                            <div>Reputation: {val.reputation}</div>
                                                        </li>
                                                        <Separator className="my-2"/>
                                                    </div>
                                                );
                                            })}
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="flex">
                            <div id="ticketCarousel"
                                 className={`ml-4 mt-10 ${shouldHideTicketCarousel ? 'hidden' : ''}`}>
                                <Carousel
                                    plugins={[plugin.current]}
                                    className="w-full max-w-xs"
                                    onMouseEnter={plugin.current.stop}
                                    onMouseLeave={plugin.current.reset}
                                >
                                    <CarouselContent>
                                        {Array.from({length: tickets}).map((_, index) => (
                                            <CarouselItem key={index}>
                                                <div className="p-1">
                                                    <Card>
                                                        <CardContent
                                                            className="flex aspect-square items-center justify-center p-6">
                                                            <span className="text-4xl font-semibold">{index + 1}</span>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default EventPage;