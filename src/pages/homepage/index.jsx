
import EventCard from "../../pages/components/content/EventCard.jsx";
import React, {useEffect} from "react";
import {toast} from "react-hot-toast";
import {blockChainFactoryContract} from '../../helper/blockchain.js';
import { useDispatch } from 'react-redux';
import {GetAllEvents} from "../../api-calls/events.js";
import {SetAllEvents} from "../../redux/eventSlice.js";
import * as Icon from "react-bootstrap-icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {Button} from "react-bootstrap";
import moment from 'moment';
function Homepage() {
    const [loading, setLoading] = React.useState(true);
    const [events, setEvents] = React.useState([]);
    const dispatch = useDispatch();
    const [filter, setFilter] = React.useState("All");
    const [allEvents, setAllEvents] = React.useState([]);
    const [title, setTitle] = React.useState("");

    const getMyEvents = async () => {
        try {
            const eventsResponse = await blockChainFactoryContract.getAllEvents();
            const response = await GetAllEvents(eventsResponse);
            if(response.success) {
                dispatch(SetAllEvents(response.data));
                setAllEvents(response.data);
                setEvents(response.data);
            }
            else {
                console.log("error getting the events");
            }
        } catch (e) {
            toast.error(e);
        } finally {
            setLoading(false);
        }
    }

    const showByFilter = () => {
        const currentDate = moment(new Date()).format("DD / MM / YYYY");
        if (filter === "All") {
            setEvents(allEvents);
            setTitle("All Events");
        }
        else if(filter === "Upcoming") {
            setEvents(allEvents.filter(
                (event) => moment(event.dateEnd).format("DD / MM / YYYY") >= currentDate)
            );

            setTitle("Upcoming Events");
        }
        else {
            setTitle(`Upcoming Events in ${filter}`);
            setEvents(allEvents.filter(
                (event) => ((event.city === filter) && (moment(event.dateEnd).format("DD / MM / YYYY") >= currentDate)))
            );
        }
        console.log(events);
    }

    useEffect(() => {
        getMyEvents();
    }, []);

    useEffect(() => {
        showByFilter();
    }, [filter])

    return (
        <>
            <div className="w-full" id="content">
                <div className="flex place-items-center">
                    <h1 className="ml-6" id="homeTitle"><i>{title}</i></h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button><Icon.Filter width="40px" color="white" height="40px" className="ml-5"/></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                                <DropdownMenuRadioItem value="All">All Events</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Upcoming">Upcoming Events</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Paris">Paris</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="New York">New York</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Nice">Nice</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Miami">Miami</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {loading ? (
                    <p>
                        Loading..
                    </p>
                ) : (

                    <div className="flex flex-wrap eventList">
                        {events.map((event) => {
                            // eslint-disable-next-line react/jsx-key
                            const myEvent = {
                                name: event.name,
                                city: event.city,
                                hourStart: event.hourStart,
                                address: event.address,
                                dateStart: event.dateStart,
                                photo: event.photo,
                                description: event.description,
                                blockAddress: event.blockAddress,
                                price: event.price,
                                reputationRequired: event.reputationRequired
                            }
                            // eslint-disable-next-line react/jsx-key
                            return <EventCard event={myEvent}/>
                        })}
                    </div>
                )}
            </div>
        </>
    )
}

export default Homepage;