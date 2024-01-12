import React, {useEffect} from "react";
import {Button} from "../../components/ui/button.jsx";
import {blockChainFactoryContract, calculateMaticTokens} from '../../helper/blockchain.js';
import {GetMyEvent, ModifyEvent} from "../../api-calls/events.js";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover"

import {
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs"

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
import { toast } from "sonner"
import QRCode from 'qrcode.react';
import {Calendar as CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import { Calendar } from "../../components/ui/calendar";
import {Textarea} from "../../components/ui/textarea.jsx";
import { cn } from "../../lib/utils.js";

function EventPage({data}) {
    const [event, setEvent] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(0)
    const [tickets, setTickets] = React.useState(0);
    const [isMetaMaskConnected, setIsMetaMaskConnected] = React.useState(false);
    const plugin = React.useRef(Autoplay({delay: 2000, stopOnInteraction: true}));
    const [shouldHideTicketCarousel, setShouldHideTicketCarousel] = React.useState(true);
    const [participants, setParticipants] = React.useState([]);
    const [admin , setAdmin] = React.useState(false);
    const [loader, setLoader] = React.useState(false);
    const [name, setName] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [reputation, setReputation] = React.useState("");
    const [nbrOfTickets, setNbrOfTickets] = React.useState("");
    const [city, setCity] = React.useState("");
    const [dateStart, setDateStart] = React.useState(new Date());
    const [hourStart, setHourStart] = React.useState("");
    const [dateEnd, setDateEnd] = React.useState(new Date());
    const [hourEnd, setHourEnd] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [address, setAddress] = React.useState("");
    let location = useLocation();
    const buyTicket = async () => {
        try {
            const priceInWei = await calculateMaticTokens(event.price);
            console.log(event.priceInWei);
            const amountToSend = quantity * priceInWei;
            console.log("amountToSend = ",amountToSend);
            const transaction = await blockChainFactoryContract.buyTickets(event.blockAddress, quantity, {value: amountToSend.toString()});
            await transaction.wait();
            const ticketsAvailable = await blockChainFactoryContract.getUserOwnedNFTsForEvent(event.blockAddress);
            setShouldHideTicketCarousel(false);
            setTickets(ticketsAvailable);
            toast("Ticket bought");
        } catch (e) {
            const errorMessageRegex = /execution reverted: (.*?)",/;
            const match = e.message.match(errorMessageRegex);
            if (match) {
                const errorMessage = match[1];
                toast(errorMessage);
            }
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
                        if(response.data[0].owner === data) {
                            setAdmin(true);
                        }
                        setName(response.data[0].name);
                        setNbrOfTickets(response.data[0].tickets);
                        setPrice(response.data[0].price);
                        setReputation(response.data[0].reputationRequired);
                        setCity(response.data[0].city);
                        setDateStart(new Date());
                        setHourStart(response.data[0].hourStart);
                        setDescription(response.data[0].description);
                        setAddress(response.data[0].address);
                        setHourEnd(response.data[0].hourEnd);
                        setDateEnd(new Date());
                        const ticketsAvailable = await blockChainFactoryContract.getUserOwnedNFTsForEvent(hexAddress);
                        setTickets(ticketsAvailable);
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

    const modifyEvent = async (blockAddress, price, nbrOfTickets, reputation, name, dateStart, dateEnd, hourStart, hourEnd, address, description, city) => {
        try {
            console.log("modified contract = ", blockAddress);
            setLoader(true);
            const priceInWei = await calculateMaticTokens(price);
            console.log(priceInWei.toString());
            const transaction = await blockChainFactoryContract.modifyEvent(blockAddress,priceInWei.toString(), parseInt(nbrOfTickets), parseInt(reputation), name );
            const receipt = await transaction.wait();
            console.log("receipt", receipt);
            const newEvent = {
                name: name,
                price: price,
                reputationRequired: reputation,
                tickets: nbrOfTickets,
                city: city,
                address: address,
                hourStart: hourStart,
                dateStart: dateStart,
                hourEnd: hourEnd,
                dateEnd: dateEnd,
                description: description,
                blockAddress: blockAddress,
                owner: data

            };
            const modifyEventResponse = await ModifyEvent(blockAddress, newEvent);
            if(modifyEventResponse.success) {
                toast("Event modified");
                setEvent(modifyEventResponse.data);
                setLoader(false);
            }
            else {
                toast("Event not modified");
            }

        } catch (e) {
            const errorMessageRegex = /execution reverted: (.*?)",/;
            const match = e.message.match(errorMessageRegex);
            if (match) {
                const errorMessage = match[1];
                toast(errorMessage);
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
        if(event) {
            if(event.owner === data) {
                setAdmin(true);
            }
            else {
                setAdmin(false);
            }
        }
        getMyEvent();
        getParticipants();
    }, [data]);

    return (
        <>
            <div className="w-full" id="content">
                {loading ? (
                    <p>
                        Loading..
                    </p>
                ) : (
                    <div className="mt-20">
                        <div className="flex justify-between">
                            {admin ? (<Tabs defaultValue="account" className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="account">Event Infos</TabsTrigger>
                                        <TabsTrigger value="password">Modify Event</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="account">
                                        <div className="eventInfos text-white w-[33vw] rounded-xl bg-gray-800 pb-5">
                                            <h1 className="ml-5" id="homeTitle"><i>{event.name}</i></h1>
                                            <Separator className=""/>
                                            <div className="ml-5 mt-2 flex place-items-center">
                                                <Icon.Nut width="40px" height="40px" color="gray-900"/>
                                                <p className="pl-3 text-purple-500">BlockChain Address: </p>
                                                <p className="pl-1">{event.blockAddress}</p>
                                            </div>
                                            <Separator className="mt-2"/>
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
                                            <Separator className=" mt-2"/>
                                            <div className="ml-5 mt-2 flex place-items-center">
                                                <Icon.House width="40px" height="40px" color="gray-900"/>
                                                <p className="pl-3 text-purple-500">{event.address}, {event.city}</p>
                                            </div>
                                            <Separator className="mb-2 mt-2"/>

                                            <br/>


                                            <ScrollArea className="h-40 w-[30vw] rounded-md border mt-2 ml-5 p-2">
                                                <p className="ml-5">{event.description}</p>
                                            </ScrollArea>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="password">
                                        <Card className="w-[550px] bg-gray-800 pb-5">
                                            <CardHeader>
                                                <CardTitle className="text-white">Modify Event</CardTitle>
                                                <CardDescription className="text-white">Modify your event in one-click.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <form>
                                                    <div className="grid w-full items-center gap-4">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">Name</Label>
                                                                <Input className="bg-gray-800 text-white" id="name" value={name}
                                                                       onChange={(e) => setName(e.target.value)} placeholder="Name of your event"/>
                                                            </div>
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">Price</Label>
                                                                <Input className="bg-gray-800 text-white" id="name" value={price}
                                                                       onChange={(e) => setPrice(e.target.value)}
                                                                       placeholder="Price of your event in $"/>
                                                            </div>
                                                        </div>
                                                        <div className="flex  justify-between">
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">Reputation</Label>
                                                                <Input className="bg-gray-800 text-white" id="name" value={reputation}
                                                                       onChange={(e) => setReputation(e.target.value)}
                                                                       placeholder="Required to participate"/>
                                                            </div>
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">Tickets</Label>
                                                                <Input className="bg-gray-800 text-white" id="name" value={nbrOfTickets}
                                                                       onChange={(e) => setNbrOfTickets(e.target.value)}
                                                                       placeholder="Number of tickets available"/>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col space-y-1.5">
                                                            <Label className="text-white" htmlFor="name">City</Label>
                                                            <Input className="bg-gray-800 text-white" id="name" value={city}
                                                                   onChange={(e) => setCity(e.target.value)}
                                                                   placeholder="The city where the event happens"/>
                                                        </div>
                                                        <div className="flex flex-col space-y-1.5">
                                                            <Label className="text-white" htmlFor="name">Address</Label>
                                                            <Input className="bg-gray-800 text-white" id="name" value={address}
                                                                   onChange={(e) => setAddress(e.target.value)}
                                                                   placeholder="Address: Street, Number"/>
                                                        </div>
                                                        <div className="flex  justify-between">
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">Date</Label>
                                                                <Popover className="bg-gray-800 text-white">
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-[280px] justify-start text-left font-normal bg-gray-800 text-white",
                                                                                !dateStart && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                                            {dateStart ? format(dateStart, "PPP") : <span>Pick a date</span>}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={dateStart}
                                                                            onSelect={setDateStart}
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">Hour</Label>
                                                                <Input className="bg-gray-800 text-white" id="name" value={hourStart}
                                                                       onChange={(e) => setHourStart(e.target.value)}
                                                                       placeholder="The starting hour"/>
                                                            </div>
                                                        </div>
                                                        <div className="flex  justify-between">
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">End</Label>
                                                                <Popover className="bg-gray-800 text-white">
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-[280px] justify-start text-left font-normal bg-gray-800 text-white",
                                                                                !dateEnd && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                                            {dateEnd ? format(dateEnd, "PPP") : <span>Pick a date</span>}
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto p-0">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={dateEnd}
                                                                            onSelect={setDateEnd}
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                            <div>
                                                                <Label className="text-white" htmlFor="name">End</Label>
                                                                <Input className="bg-gray-800 text-white" id="name" value={hourEnd}
                                                                       onChange={(e) => setHourEnd(e.target.value)}
                                                                       placeholder="The ending hour"/>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col space-y-1.5">
                                                            <Label className="text-white" htmlFor="name">Description</Label>
                                                            <Textarea className="bg-gray-800 text-white" id="name" value={description}
                                                                      onChange={(e) => setDescription(e.target.value)}
                                                                      placeholder="Event description"/>
                                                        </div>
                                                    </div>
                                                </form>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">

                                                <Button onClick={() => modifyEvent(event.blockAddress, price, nbrOfTickets, reputation, name, dateStart, dateEnd, hourStart, hourEnd, address, description, city)}>Modify</Button>
                                            </CardFooter>
                                        </Card>
                                    </TabsContent>
                                </Tabs>) : (
                                <div className="eventInfos text-white w-[33vw] rounded-xl bg-gray-800 pb-5">
                                    <h1 className="ml-5" id="homeTitle"><i>{event.name}</i></h1>
                                    <Separator className=""/>
                                    <div className="ml-5 mt-2 flex place-items-center">
                                        <Icon.Nut width="40px" height="40px" color="gray-900"/>
                                        <p className="pl-3 text-purple-500">BlockChain Address: </p>
                                        <p className="pl-1">{event.blockAddress}</p>
                                    </div>
                                    <Separator className="mt-2"/>
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
                                    <Separator className=" mt-2"/>
                                    <div className="ml-5 mt-2 flex place-items-center">
                                        <Icon.House width="40px" height="40px" color="gray-900"/>
                                        <p className="pl-3 text-purple-500">{event.address}, {event.city}</p>
                                    </div>
                                    <Separator className="mb-2 mt-2"/>

                                    <br/>


                                    <ScrollArea className="h-40 w-[30vw] rounded-md border mt-2 ml-5 p-2">
                                        <p className="ml-5">{event.description}</p>
                                    </ScrollArea>
                                </div>
                            )}
                            <div className="banner-image-event-page"></div>
                        </div>

                        <div className="mt-10 flex">
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant="outline" className=" pur border-0 ">Buy Tickets Now At ${event.price}</Button>
                                </DrawerTrigger>
                                <DrawerContent className="bg-gray-700 text-white">
                                    <div className="mx-auto w-full max-w-sm">
                                        <DrawerHeader>
                                            <DrawerTitle>How many tickets you want?</DrawerTitle>
                                        </DrawerHeader>
                                        <div className="p-4 pb-0">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 rounded-full text-black"
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
                                                    className="h-8 w-8 shrink-0 rounded-full text-black"
                                                    onClick={() => onClick(1)}
                                                >
                                                    <PlusIcon className="h-4 w-4"/>
                                                    <span className="sr-only">Increase</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <DrawerFooter>
                                            <Button onClick={buyTicket} className="bg-gray-900">Buy Tickets</Button>
                                            <DrawerClose asChild>
                                                <Button variant="outline" className="text-black">Cancel</Button>
                                            </DrawerClose>
                                        </DrawerFooter>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                            <div className="stats ml-5">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button className="w-[22vw] border-0 " variant="outline">This event
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
                                        {Array.from({length: tickets.length}).map((_, index) => (
                                            <CarouselItem key={index}>
                                                <div className="p-1">
                                                    <Card>
                                                        <CardContent
                                                            className="flex aspect-square items-center justify-center p-6">
                                                            <span className="text-4xl font-semibold"><QRCode value={tickets[index]._hex} /></span>
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