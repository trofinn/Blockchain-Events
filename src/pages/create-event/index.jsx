
import {Card, CardTitle, CardHeader, CardContent, CardDescription, CardFooter} from "../../components/ui/card.jsx";
import {Input} from "../../components/ui/input.jsx";
import {Label} from "../../components/ui/label.jsx";
import {Button} from "../../components/ui/button.jsx";
import React from "react";
import {toast} from "react-hot-toast";
import {
    blockChainEventsAdress,
    blockChainFactoryContract,
    calculateMaticTokens,
    EventTicketingABI,
    signer
} from '../../helper/blockchain.js';
import {Textarea} from "../../components/ui/textarea.jsx";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../lib/utils.js";
import { Calendar } from "../../components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../components/ui/popover";
import {CreateEventCall} from "../../api-calls/events.js";
import {ethers} from "ethers";
import web3 from "web3";

function CreateEvent() {
    const [name, setName] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [reputation, setReputation] = React.useState("");
    const [tickets, setTickets] = React.useState("");
    const [city, setCity] = React.useState("");
    const [dateStart, setDateStart] = React.useState(new Date());
    const [hourStart, setHourStart] = React.useState("");
    const [dateEnd, setDateEnd] = React.useState(new Date());
    const [hourEnd, setHourEnd] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [address, setAddress] = React.useState("");

    const createEvent = async (name, price, reputation, tickets, city, address, dateStart, hourStart, dateEnd, hourEnd, description) => {
        try {
            const priceInWei = await calculateMaticTokens(price);
            console.log(priceInWei.toString());
            const transaction = await blockChainFactoryContract.createEvent(name,parseInt(tickets), priceInWei.toString(), parseInt(reputation) );
            const receipt = await transaction.wait();
            const eventAddress = receipt.logs[0].address;
            console.log("receipt", receipt);
            const newEvent = {
                name: name,
                price: price,
                reputationRequired: reputation,
                tickets: tickets,
                city: city,
                address: address,
                hourStart: hourStart,
                dateStart: dateStart,
                hourEnd: hourEnd,
                dateEnd: dateEnd,
                description: description,
                blockAddress: eventAddress,
            };
            const createEventResponse = await CreateEventCall(newEvent);
            if(createEventResponse.success) {
                toast.success("Event created");
                setName("");
                setTickets("");
                setPrice("");
                setReputation("");
                setCity("");
                setDateStart(new Date());
                setHourStart("");
                setDescription("");
                setAddress("");
                setHourEnd("");
                setDateEnd(new Date());
            }
            else {
                toast.error("Event not created");
            }

        } catch (e) {
            toast.error("Event not created");
        }

    }

    const cancelButton = () => {
        setName("");
        setTickets("");
        setPrice("");
        setReputation("");
        setCity("");
        setDateStart(new Date());
        setHourStart("");
        setDescription("");
        setAddress("");
        setHourEnd("");
        setDateEnd(new Date());
    };

    return (
        <>
            <div className="w-full rounded m-1" id="content">
                <h1 className="ml-6" id="homeTitle"><i>New Event</i></h1>
                <Card className="w-[550px]" id="createEventCard">
                    <CardHeader>
                        <CardTitle className="text-white">Create event</CardTitle>
                        <CardDescription className="text-white">Create your new event in one-click.</CardDescription>
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
                                               placeholder="Price of your event"/>
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
                                        <Input className="bg-gray-800 text-white" id="name" value={tickets}
                                               onChange={(e) => setTickets(e.target.value)}
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
                        <Button onClick={cancelButton} variant="outline">Cancel</Button>
                        <Button onClick={() => createEvent(name, price, reputation, tickets, city, address, dateStart, hourStart, dateEnd, hourEnd, description)}>Create</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default CreateEvent